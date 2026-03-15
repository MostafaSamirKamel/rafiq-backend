const VideoJob = require('../models/VideoJob');
const Child = require('../models/Child');
const runwayClient = require('../config/runway');

// @desc    Request to generate a signal/emotion video
// @route   POST /phase2/generate-video
// @access  Private
const generateVideo = async (req, res) => {
    const { childId, type, target } = req.body;

    const child = await Child.findById(childId);
    if (!child) {
        res.status(404);
        throw new Error('Child not found');
    }

    try {
        const prompts = {
            gesture: {
                hello: "Create a clear and easy-to-understand educational video animation from this image. The person should slowly raise one hand and gently wave hello twice. The hand movement should be large and clearly visible for nonverbal learning. Keep the head, shoulders, and torso completely still. Add a friendly facial expression with a soft smile. Smooth motion, stable camera, no distortion, preserve identity, simple background, high quality.",
                no_hand: "Create a clear and easy-to-understand educational animation from this image. The person should slowly and clearly shake their head left and right to indicate a strong \"no\". The movement should be slightly exaggerated but realistic and repeated twice for clarity. Add a serious facial expression showing disapproval. Optionally raise one hand in a gentle stop gesture. Smooth motion, stable background, no distortion, preserve identity, high quality.",
                no_head: "Create a clear and easy-to-understand video animation from this image. The person should slowly and clearly shake their head left and right to indicate \"no\". The movement should be exaggerated but realistic and repeated twice. Head movement only — no hand movement, no body movement. Keep shoulders and torso completely still. Slightly serious facial expression. Smooth motion, stable camera, no distortion, preserve identity, high quality.",
                yes: "Create a clear educational video animation from this image. The person should slowly nod their head up and down to indicate \"yes\". The movement should be slightly exaggerated but realistic and repeated twice for clarity. Head movement only — no hand or body movement. Keep shoulders and background completely still. Add a gentle positive facial expression. Smooth motion, stable camera, no distortion, preserve identity, high quality.",
                goodbye: "Educational style animation. The person slowly raises one hand and clearly waves goodbye twice. Large, visible hand movement at slow speed for clear nonverbal communication. Keep the head, shoulders, and torso completely still. No distortion, stable background, high clarity, smooth motion.",
            },
            emotion: {
                sad: "Create a clear emotional educational animation from this image. The person should show a clear sad facial expression: slightly lowered head, downturned mouth, and soft eyes. No head movement, no hand movement, no body movement. Only facial expression change. Keep the background stable and simple. Smooth transition, no distortion, preserve identity, high quality.",
                happy: "Create a clear educational emotional animation from this image. The person should show a bright happy facial expression with a natural smile and slightly raised cheeks. Keep head, shoulders, and torso completely still. No hand movement. Smooth and natural facial expression change. Stable camera, no distortion, preserve identity, high quality.",
                angry: "Create a clear educational emotional animation from this image. The person should show a clear angry facial expression: slightly lowered eyebrows, firm lips, and intense eyes. No head movement, no hand movement, no body movement. Only facial expression change. Keep background stable and simple. Smooth motion, no distortion, preserve identity, high quality.",
            }
        };

        const prompt = prompts[type] && prompts[type][target]
            ? prompts[type][target]
            : `Create an educational animation of a child named ${child.name} performing the ${target} ${type}. High quality, preserve identity.`;

        const response = await runwayClient.post('/image_to_video', {
            model: 'gen4_turbo',
            promptImage: child.photoUrl,
            promptText: prompt,
            duration: 5,
            ratio: '1280:720'
        });

        const job = await VideoJob.create({
            childId,
            runwayJobId: response.data.id,
            status: 'pending',
            type,
            target,
        });

        res.status(202).json(job);
    } catch (error) {
        console.error(error);
        res.status(500);
        throw new Error('Runway API request failed: ' + error.message);
    }
};

// @desc    Get video job status
// @route   GET /phase2/video-status/:jobId
// @access  Private
const getVideoStatus = async (req, res) => {
    const job = await VideoJob.findById(req.params.jobId);

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    // In a real app, we'd poll Runway or use a Webhook
    try {
        const response = await runwayClient.get(`/tasks/${job.runwayJobId}`);

        if (response.data.status === 'SUCCEEDED') {
            job.status = 'ready';
            job.videoUrl = response.data.output[0];
            await job.save();
        } else if (response.data.status === 'FAILED') {
            job.status = 'failed';
            await job.save();
        }

        res.json(job);
    } catch (error) {
        res.status(500);
        throw new Error('Failed to fetch job status from Runway');
    }
};

module.exports = { generateVideo, getVideoStatus };
