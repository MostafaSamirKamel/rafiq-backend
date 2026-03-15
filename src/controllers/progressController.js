const Session = require('../models/Session');
const Child = require('../models/Child');

// @desc    Get child progress overview
// @route   GET /progress/:childId/overview
// @access  Private
const getProgressOverview = async (req, res) => {
    const { childId } = req.params;

    const sessions = await Session.find({ childId }).sort('startTime');

    if (!sessions || sessions.length === 0) {
        return res.json({
            message: 'No sessions found for this child',
            overview: {
                phase1: 0,
                phase2: 0,
                phase3: 0,
                overall: 0
            }
        });
    }

    // Aggregate completion by phase
    const phaseStats = {
        1: { total: 0, completed: 0 },
        2: { total: 0, completed: 0 },
        3: { total: 0, completed: 0 },
    };

    sessions.forEach(session => {
        phaseStats[session.phase].total++;
        if (session.status === 'completed') {
            phaseStats[session.phase].completed++;
        }
    });

    const overview = {
        phase1: phaseStats[1].total > 0 ? (phaseStats[1].completed / phaseStats[1].total) * 100 : 0,
        phase2: phaseStats[2].total > 0 ? (phaseStats[2].completed / phaseStats[2].total) * 100 : 0,
        phase3: phaseStats[3].total > 0 ? (phaseStats[3].completed / phaseStats[3].total) * 100 : 0,
    };

    overview.overall = (overview.phase1 + overview.phase2 + overview.phase3) / 3;

    res.json({
        childId,
        overview,
        history: sessions,
    });
};

// @desc    Export progress report (Placeholder for PDF)
// @route   GET /progress/:childId/export
// @access  Private
const exportReport = async (req, res) => {
    // In a real implementation, this would use a library like 'pdfkit' or 'puppeteer'
    // to generate a PDF and return the file or a Cloudinary URL to it.
    res.json({
        message: 'Report generation initiated. You will receive a notification when ready.',
        downloadUrl: `https://api.rafiq.ai/reports/temp-report-${req.params.childId}.pdf`
    });
};

module.exports = { getProgressOverview, exportReport };
