const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 5 * 1024 * 1024},
    fileFilter: function(req, file, cb) {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('upload only PDF'));
        }
    }
});

mongoose.connect('mongodb://127.0.0.1:27017/jobsweb')
    .then(() => {
        console.log('Connected to MongoDB successfully!');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

// User Schema
const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    user_type: {type: String, required: true, enum: ['company', 'personal']},
    personal_min_experience: {type:Number,default:0,min:0},
    personal_requirements: {type: [String], default: []}
});

const User = mongoose.model('User', userSchema);

// POST /register
async function signUpRegister(req, res) {
    try {
        const {username, password, user_type} = req.body;

        if (!username || !password || !user_type) {
            return res.status(400).json({error: 'fill all files'});
        }

        if (user_type !== 'company' && user_type !== 'personal') {
            return res.status(400).json({error: 'invalid user type'});
        }

        const existingUser = await User.findOne({username: username});

        if (existingUser) {
            return res.status(400).json({error: 'this user name is already taken'});
        }

        const newUser = new User({username: username, password: password, user_type: user_type});
        await newUser.save();

        res.status(201).json({
            message: 'User registered successfully!',
            user_type: user_type,
            userId: newUser._id
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({error: 'server error'});
    }
}

// POST /login
async function signInRegister(req, res) {
    try {
        const {username, password, user_type} = req.body;
        const existingUser = await User.findOne({username: username, password: password, user_type: user_type});

        if (!existingUser) {
            return res.status(400).json({error: 'invalid username, password or user type'});
        }

        res.status(200).json({
            message: 'Logged in successfully!',
            user_type: existingUser.user_type,
            userId: existingUser._id
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({error: 'server error while registering'});
    }
}

// User Routes
app.post('/register', signUpRegister);
app.post('/login', signInRegister);


app.get('/users/:id/settings', async function(req, res) {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({error:'user not found'});
        }

        res.status(200).json({
            personal_min_experience: user.personal_min_experience,
            personal_requirements: user.personal_requirements
        });
    } catch (err) {
        console.error('Get settings error:', err);
        res.status(500).json({error: 'error in getting user data'});
    }
});

app.put('/users/:id/settings', async function(req, res) {
    try {
        const {personal_min_experience, personal_requirements} = req.body;

        if (personal_min_experience < 0) {
            return res.status(400).json({error: 'xperience not valid'});
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                personal_min_experience: personal_min_experience,
                personal_requirements: personal_requirements
            },
            {new: true, runValidators: true}
        );

        if (!updatedUser) {
            return res.status(404).json({error: 'user not found'});
        }

        res.status(200).json({
            personal_min_experience: updatedUser.personal_min_experience,
            personal_requirements: updatedUser.personal_requirements
        });
    } catch (err) {
        console.error('Update settings error:', err);
        res.status(500).json({error: 'error while saving user setting'});
    }
});
// Job Schema
const jobSchema = new mongoose.Schema({
    title: {type: String, required: true},
    company: {type: String, required: true},
    companyId: {type: mongoose.Schema.Types.ObjectId, required: true},
    location: {type: String, required: true},
    description: {type: String, required: true},
    minimumExperience: {type: Number, required: true, min: 0},
    requirements: {type: [String], required: true},
    minimumMatch: {type: Number, required: true, min: 0, max: 100},
    candidates: {type: [Buffer], default: []}
});

const Job = mongoose.model('Job', jobSchema);

// POST /jobs
app.post('/jobs', async function(req, res) {
    try {
        const {companyId} = req.body;

        if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({error: 'companyId not valid'});
        }

        const company = await User.findOne({_id: companyId, user_type: 'company'});

        if (!company) {
            return res.status(400).json({error:'company not found'});
        }

        const newJob = new Job(req.body);
        await newJob.save();

        res.status(201).json(newJob);
    } catch (err) {
        console.error('Job creation error:', err);
        res.status(500).json({error: 'error while saving job'});
    }
});

// GET /jobs - company jobs
app.get('/jobs', async function(req, res) {
    try {
        const {companyId} = req.query;

        if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({error: 'invalid companyId '});
        }

        const jobs = await Job.find({companyId: companyId});
        res.status(200).json(jobs);
    } catch (err) {
        console.error('Get jobs error:', err);
        res.status(500).json({error: 'error in getting jobs'});
    }
});

// GET /alljobs - all jobs for candidates
app.get('/alljobs', async function(req, res) {
    try {
        const jobs = await Job.find({});
        res.status(200).json(jobs);
    } catch (err) {
        console.error('Get all jobs error:', err);
        res.status(500).json({error: 'error in getting jobs'});
    }
});
app.get('/jobs/:id/candidates/:index', async function(req, res) {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({error: 'job not found'});
        }

        const index = Number(req.params.index);

        if (!Number.isInteger(index) || index < 0 || index >= job.candidates.length) {
            return res.status(404).json({error: 'resume not found'});
        }

        res.set('Content-Type', 'application/pdf');
        res.send(job.candidates[index]);
    } catch (err) {
        console.error('Get candidate resume error:', err);
        res.status(500).json({error: 'שגיאה בשליפת קורות החיים'});
    }
});

// PUT /jobs/:id
app.put('/jobs/:id', async function(req, res) {
    try {
        const {companyId, ...jobData} = req.body;

        if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({error: 'invalid companyId '});
        }

        const updatedJob = await Job.findOneAndUpdate(
            {_id: req.params.id, companyId: companyId},
            jobData,
            {new: true, runValidators: true}
        );

        if (!updatedJob) {
            return res.status(404).json({error: 'job not found'});
        }

        res.status(200).json(updatedJob);
    } catch (err) {
        console.error('Update job error:', err);
        res.status(500).json({error:'error while saving job'});
    }
});

// DELETE /jobs/:id
app.delete('/jobs/:id', async function(req, res) {
    try {
        const {companyId} = req.query;

        if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
            return res.status(400).json({error: 'invalid companyId '});
        }

        const deletedJob = await Job.findOneAndDelete({_id: req.params.id, companyId: companyId});

        if (!deletedJob) {
            return res.status(404).json({error: 'job not found'});
        }

        res.status(200).json({message: 'job deleted'});
    } catch (err) {
        console.error('Delete job error:', err);
        res.status(500).json({error: 'error in delete job'});
    }
});

// POST /jobs/:id/apply
async function applyToJob(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({error: 'PDF not found'});
        }

        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({error: 'job not found'});
        }

        job.candidates.push(req.file.buffer);
        await job.save();

        res.status(200).json({message: 'resume submitted'});
    } catch (err) {
        console.error('Apply error:', err);
        res.status(500).json({error: 'error in submitting resume'});
    }
}

app.post('/jobs/:id/apply', upload.single('resume'), applyToJob);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});