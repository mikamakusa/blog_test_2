import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Checkbox,
    FormControlLabel,
    Box,
    Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const POLLS_URI = process.env.REACT_APP_POLLS_URI || 'localhost:5006';

const PollManagement = () => {
    const [polls, setPolls] = useState([]);
    const [question, setQuestion] = useState('');
    const [answers, setAnswers] = useState(['', '']);
    const [isActive, setIsActive] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchPolls();
    }, []);

    const fetchPolls = async () => {
        try {
            const response = await axios.get(`http://${POLLS_URI}/api/polls`);
            setPolls(response.data);
        } catch (error) {
            setError('Failed to fetch polls');
        }
    };

    const handleAddAnswer = () => {
        setAnswers([...answers, '']);
    };

    const handleAnswerChange = (index, value) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const handleRemoveAnswer = (index) => {
        const newAnswers = answers.filter((_, i) => i !== index);
        setAnswers(newAnswers);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (answers.some(answer => !answer.trim())) {
            setError('All answers must be filled');
            return;
        }

        try {
            await axios.post(`http://${POLLS_URI}/api/polls`, {
                question,
                answers: answers.map(text => ({ text, votes: 0 })),
                isActive
            });
            setSuccess('Poll created successfully');
            setQuestion('');
            setAnswers(['', '']);
            setIsActive(true);
            fetchPolls();
        } catch (error) {
            setError('Failed to create poll');
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://${POLLS_URI}/api/polls/${id}`);
            fetchPolls();
            setSuccess('Poll deleted successfully');
        } catch (error) {
            setError('Failed to delete poll');
        }
    };

    const handleToggleActive = async (poll) => {
        try {
            await axios.patch(`http://${POLLS_URI}/api/polls/${poll._id}`, {
                isActive: !poll.isActive
            });
            fetchPolls();
            setSuccess('Poll status updated successfully');
        } catch (error) {
            setError('Failed to update poll status');
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Poll Management
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Create New Poll
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        margin="normal"
                        required
                    />
                    
                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                        Answers
                    </Typography>
                    {answers.map((answer, index) => (
                        <Box key={index} sx={{ display: 'flex', mb: 1 }}>
                            <TextField
                                fullWidth
                                label={`Answer ${index + 1}`}
                                value={answer}
                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                                required
                            />
                            {answers.length > 2 && (
                                <IconButton onClick={() => handleRemoveAnswer(index)}>
                                    <DeleteIcon />
                                </IconButton>
                            )}
                        </Box>
                    ))}
                    
                    <Button
                        startIcon={<AddIcon />}
                        onClick={handleAddAnswer}
                        sx={{ mt: 1 }}
                    >
                        Add Answer
                    </Button>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                            />
                        }
                        label="Active"
                        sx={{ mt: 2, display: 'block' }}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                    >
                        Create Poll
                    </Button>
                </form>
            </Paper>

            <Typography variant="h6" gutterBottom>
                Existing Polls
            </Typography>
            <List>
                {polls.map((poll) => (
                    <Paper key={poll._id} sx={{ mb: 2 }}>
                        <ListItem>
                            <ListItemText
                                primary={poll.question}
                                secondary={`${poll.answers.length} answers`}
                            />
                            <ListItemSecondaryAction>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={poll.isActive}
                                            onChange={() => handleToggleActive(poll)}
                                        />
                                    }
                                    label="Active"
                                />
                                <IconButton
                                    edge="end"
                                    onClick={() => handleDelete(poll._id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    </Paper>
                ))}
            </List>
        </Container>
    );
};

export default PollManagement; 