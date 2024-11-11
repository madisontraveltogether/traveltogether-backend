// services/pollService.js
const Trip = require('../models/tripModel');

// Create a new poll
exports.createPoll = async (tripId, pollData) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const poll = {
    question: pollData.question,
    options: pollData.options.map((option) => ({ text: option, votes: 0 })),
    expirationDate: pollData.expirationDate,
    maxVotesPerUser: pollData.maxVotesPerUser || 1,
    createdAt: new Date(),
  };

  trip.polls.push(poll);
  await trip.save();

  return poll;
};

// Get all polls for a specific trip
exports.getPolls = async (tripId) => {
  const trip = await Trip.findById(tripId);
  return trip ? trip.polls : [];
};

// Get details of a specific poll
exports.getPollDetails = async (tripId, pollId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const poll = trip.polls.id(pollId);
  if (!poll) throw new Error('Poll not found');

  return poll;
};

// Update a specific poll
exports.updatePoll = async (tripId, pollId, updateData) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const poll = trip.polls.id(pollId);
  if (!poll) throw new Error('Poll not found');

  // Update poll fields
  if (updateData.question) poll.question = updateData.question;
  if (updateData.options) {
    poll.options = updateData.options.map((option) => ({ text: option, votes: 0 }));
  }
  if (updateData.expirationDate) poll.expirationDate = updateData.expirationDate;
  if (typeof updateData.maxVotesPerUser !== 'undefined') poll.maxVotesPerUser = updateData.maxVotesPerUser;

  await trip.save();
  return poll;
};

// Vote on a poll option
exports.voteOnPoll = async (tripId, pollId, optionId, userId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const poll = trip.polls.id(pollId);
  if (!poll) throw new Error('Poll not found');

  // Check if the poll has expired
  if (poll.expirationDate && new Date() > new Date(poll.expirationDate)) {
    throw new Error('Poll has expired');
  }

  // Check if the user has already voted on this poll
  if (poll.votes && poll.votes.some((vote) => vote.userId.toString() === userId)) {
    throw new Error('User has already voted on this poll');
  }

  const option = poll.options.id(optionId);
  if (!option) throw new Error('Option not found');

  option.votes += 1;
  poll.votes = poll.votes || [];
  poll.votes.push({ userId, optionId });

  await trip.save();
  return poll;
};

// Get poll results by ID
exports.getPollResults = async (tripId, pollId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const poll = trip.polls.id(pollId);
  if (!poll) throw new Error('Poll not found');

  return poll.options.map((option) => ({
    text: option.text,
    votes: option.votes,
  }));
};

// Delete a specific poll
exports.deletePoll = async (tripId, pollId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const poll = trip.polls.id(pollId);
  if (!poll) throw new Error('Poll not found');

  poll.remove();
  await trip.save();

  return poll;
};
