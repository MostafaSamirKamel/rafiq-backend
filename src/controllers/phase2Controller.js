const VideoJob = require('../models/VideoJob');
const Child = require('../models/Child');
const RecognitionItem = require('../models/RecognitionItem');
const runwayClient = require('../config/runway');
const videoPrompts = require('../config/videoPrompts');

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
        let prompt = '';
        let promptImage = child.photoUrl;
        let recognitionItemId = null;

        if (type === 'recognition') {
            const item = await RecognitionItem.findById(target);
            if (!item) {
                res.status(404);
                throw new Error('Recognition item not found');
            }
            recognitionItemId = item._id;
            promptImage = item.photoUrl;
            
            // Use custom prompt if available, else use generic template
            if (item.videoPrompt) {
                prompt = item.videoPrompt;
            } else {
                const template = videoPrompts.recognition[item.type] || videoPrompts.recognition.object;
                prompt = template.replace(`[${item.type.toUpperCase()}_NAME]`, item.name);
            }
        } else {
            prompt = videoPrompts[type] && videoPrompts[type][target]
                ? videoPrompts[type][target]
                : `Create an educational animation of a child named ${child.name} performing the ${target} ${type}. High quality, preserve identity.`;
        }

        const response = await runwayClient.post('/image_to_video', {
            model: 'gen4_turbo',
            promptImage: promptImage,
            promptText: prompt,
            duration: 5,
            ratio: '1280:720'
        });

        const job = await VideoJob.create({
            childId,
            recognitionItemId,
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

            // If it's a recognition item, update the item with the video URL
            if (job.recognitionItemId) {
                await RecognitionItem.findByIdAndUpdate(job.recognitionItemId, {
                    videoUrl: job.videoUrl
                });
            }
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
