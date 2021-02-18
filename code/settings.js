module.exports = {
	bcryptRounds: 12,
	botEmailAddress: "noreply@cybervolunteers.org.uk",
	emailVerificationTime: 10 * 60, //10 mins
	emailBatchSendingTime: 60 * 60 * 24 * 7, // 7 days
	emailBatchCheckTime: 1000 * 60 * 60, // 1h

	passwordResetCodeLength: 4, // 8 letters
	passwordResetCodeTimeout: 60 * 5, // in seconds, every 5 minutes
}; 
