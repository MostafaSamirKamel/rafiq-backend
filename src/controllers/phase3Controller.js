const Session = require('../models/Session');
const runwayClient = require('../config/runway');

// @desc    Evaluate child's speech response
// @route   POST /api/v1/phase3/evaluate-response
// @access  Private
const evaluateSpeech = async (req, res) => {
    const { childId, sessionId, transcribedText, expectedText } = req.body;

    // Simple logic for evaluation: basic string comparison or similarity
    // In a real app, this would use an LLM or a specialized NLP service
    const isCorrect = transcribedText.toLowerCase().includes(expectedText.toLowerCase());

    const session = await Session.findById(sessionId);
    if (session) {
        session.score += isCorrect ? 33 : 0; // Cumulative score for 3 questions
        if (session.score >= 100) session.status = 'completed';
        await session.save();
    }

    res.json({
        correct: isCorrect,
        feedback: isCorrect ? 'Bravo!' : 'Try again gently',
        session,
    });
};

// @desc    Simplified AI Chat for Social Initiative
// @route   POST /api/v1/phase3/ai-chat
// @access  Private
const aiChat = async (req, res) => {
    const { childId, message } = req.body;

    // Simple response for now - in production this would call an LLM
    res.json({
        success: true,
        message: `Hello! I heard you say: "${message}". You're doing a great job!`,
        childId
    });
};

// @desc    Transform speech using RunwayML Speech-to-Speech
// @route   POST /api/v1/phase3/speech-to-speech
// @access  Private
const speechToSpeech = async (req, res) => {
    const { promptText, presetId, audioUrl } = req.body;

    try {
        const response = await runwayClient.post('/speech_to_speech', {
            model: 'eleven_multilingual_sts_v2',
            promptText: promptText || 'Translate this speech into a friendly character voice',
            voice_preset: 'runway-preset',
            presetId: presetId || 'Maya',
            audio: audioUrl,
        }, {
            headers: {
                'X-Runway-Version': '2024-11-06'
            }
        });

        res.status(202).json({
            message: 'Speech-to-Speech transformation initiated',
            runwayJobId: response.data.id,
            status: 'pending'
        });
    } catch (error) {
        console.error(error);
        res.status(500);
        throw new Error('Runway Speech-to-Speech request failed: ' + error.message);
    }
};

module.exports = { evaluateSpeech, aiChat, speechToSpeech };
