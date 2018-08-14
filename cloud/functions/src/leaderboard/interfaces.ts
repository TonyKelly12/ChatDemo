/**
 * Enumeration to identify the differcent types of supported durations
 * for the data. For example, a "MONTH" denotes data from the
 * beginning of the month until today. A "WEEK" corresponds to data
 * from the beginning of the week until now.  A "DAY" corresponds
 * to data from midnight until now.
 */
export enum DurationType {
	MONTH,
	WEEK,
	DAY
}

/**
 * Type of sensor data being collected.
 */
export enum SensorType {
	STEPS,
	WEIGHT,
	CARDIO,
	UNKNOWN
}

/**
 * A configuration interface for configuring a Leaderboard.
 */
export interface LeaderBoardConfigs {
	memberId: string
	gymId: string
	arenaId: string
}

/**
 * Storage Unit in Firestore for a Leaderboard.
 */
export interface ContestantRank {
	rank: number,
	lastRank: number,
	points: number,
	username: string,
	memberId: string,
	lastUpdated: Date
}

/**
 * A unit of storage for health data. Here, health data
 * can denote any of "Steps', 'Weight', etc.
 */
export interface SensorDatum {
	startDate: Date,
	endDate: Date,
	value: number,
	type: SensorType
}

/**
 * THe REST Request for storing health data.
 */
export interface SensorDataUploadRequest {
	configuration: LeaderBoardConfigs
	data: SensorDatum[]
}

/**
 * Storage Unit which holds one leaderboard.
 */
export interface LeaderBoardPU {
	durationType: DurationType,
	gymId: string,
	arenaId: string,
	contestants: ContestantRank[]
}

/**
 * Minimum amount of information that should be stored
 * in Firestore in the user's profile document. Without
 * all this information, we can't function.
 */
export interface MemberEssentials {
	id: string,
	username: string,
	joined: Date,
	firstName: string,
	lastName: string
}
