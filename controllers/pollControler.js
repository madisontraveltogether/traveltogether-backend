// pollService.js
const Trip = require('../models/tripModel');

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

exports.getPolls = async (tripId) => {
  const trip = await Trip.findById(tripId);
  return trip ? trip.polls : [];
};

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

exports.deletePoll = async (tripId, pollId) => {
  const trip = await Trip.findById(tripId);
  if (!trip) throw new Error('Trip not found');

  const poll = trip.polls.id(pollId);
  if (!poll) throw new Error('Poll not found');

  poll.remove();
  await trip.save();

  return poll;
};
