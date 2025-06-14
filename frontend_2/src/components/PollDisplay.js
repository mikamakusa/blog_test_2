import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    Button,
    Box,
    LinearProgress,
    Alert
} from '@mui/material';
import axios from 'axios';

// Configure axios defaults
axios.defaults.timeout = 5000; // 5 seconds timeout
axios.defaults.headers.common['Cache-Control'] = 'no-cache';

const POLLS_URI = process.env.REACT_APP_POLLS_URI || 'localhost:5006';

const PollDisplay = () => {
    const [poll, setPoll] = useState(null);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivePoll();
    }, []);

    const fetchActivePoll = async () => {
        try {
            const response = await axios.get(`http://${POLLS_URI}/api/polls/active`);
            setPoll(response.data);
            setLoading(false);
        } catch (error) {
            setError('Failed to load poll');
            setLoading(false);
        }
    };

    const handleVote = async () => {
        if (!selectedAnswer) return;

        try {
            await axios.post(`http://${POLLS_URI}/api/polls/${poll._id}/vote`, {
                answerIndex: selectedAnswer
            });
            setHasVoted(true);
            fetchActivePoll(); // Refresh poll data to show updated votes
        } catch (error) {
            setError('Failed to submit vote');
        }
    };

    if (loading) {
        return <LinearProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (!poll) {
        return null;
    }

    const totalVotes = poll.answers.reduce((sum, answer) => sum + answer.votes, 0);

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Current Poll
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                {poll.question}
            </Typography>

            {!hasVoted ? (
                <>
                    <RadioGroup
                        value={selectedAnswer}
                        onChange={(e) => setSelectedAnswer(Number(e.target.value))}
                    >
                        {poll.answers.map((answer, index) => (
                            <FormControlLabel
                                key={index}
                                value={index}
                                control={<Radio />}
                                label={answer.text}
                            />
                        ))}
                    </RadioGroup>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleVote}
                        disabled={selectedAnswer === null}
                        sx={{ mt: 2 }}
                    >
                        Vote
                    </Button>
                </>
            ) : (
                <Box sx={{ mt: 2 }}>
                    {poll.answers.map((answer, index) => {
                        const percentage = totalVotes > 0
                            ? (answer.votes / totalVotes) * 100
                            : 0;
                        
                        return (
                            <Box key={index} sx={{ mb: 2 }}>
                                <Typography variant="body2">
                                    {answer.text}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ width: '100%', mr: 1 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={percentage}
                                            sx={{ height: 10, borderRadius: 5 }}
                                        />
                                    </Box>
                                    <Box sx={{ minWidth: 35 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {`${Math.round(percentage)}%`}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    {`${answer.votes} votes`}
                                </Typography>
                            </Box>
                        );
                    })}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Total votes: {totalVotes}
                    </Typography>
                </Box>
            )}
        </Paper>
    );
};

export default PollDisplay; 