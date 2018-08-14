import * as defs from './interfaces';
import * as user from './user-data';

/**
 * Class used to manage the leaderboard.
 * @param configuration Configuration to use for the leaderboard.
 */
export class LeaderBoardManager {
	private static VERY_LOW_RANK = Number.MAX_VALUE;
	private static INITIAL_RANK = Number.MAX_VALUE;
	private durationType: defs.DurationType;
	private userStorage: user.UserHealthDataManager;
	private leaderboardCollection: FirebaseFirestore.CollectionReference;
	private configuration: defs.LeaderBoardConfigs
	private db: FirebaseFirestore.Firestore;
	private leaderboardCollectionPath: string;

	constructor(duration: defs.DurationType, configuration: defs.LeaderBoardConfigs, db: FirebaseFirestore.Firestore, userStorage: user.UserHealthDataManager) {
		this.configuration = configuration;
		this.db = db;
		this.userStorage = userStorage;
		this.durationType = duration;

		this.leaderboardCollectionPath = '/gyms/' + this.configuration.gymId + '/arenaRefs/' + this.configuration.arenaId + '/leaderboards';
		this.leaderboardCollection = this.db.collection(this.leaderboardCollectionPath);
	}

	public generateAndPersist(contestantData: defs.SensorDatum[]): Promise<void> {
		const promise = new Promise<void>((response, reject) => {
			this.leaderboardCollection
				.where('durationType', '==', this.durationType).get()
				.then((querySnapshot) => {

					const lbdRef = querySnapshot.docs[0];
					let contestants: defs.ContestantRank[];
					if (querySnapshot.empty) {
						contestants = [];
					} else {
						contestants = lbdRef.data().contestants;
					}
					console.info('Calculating new leaderboard updates');
					const pu = this.calculateLBPU(contestants, contestantData);

					console.info('Updating leaderboard to database');
					this.printPu(pu);

					console.info('Updating existing leaderboard to: ' + this.leaderboardCollectionPath);
					return querySnapshot.docs[0].ref.update(pu).then(() => {
						response();
					}).catch((error) => {
						reject('Unable to recalculate leaderboard: ' + error);
					});

				}).catch((error) => {
					reject('Unable to add leaderboard to db: ' + error);
				});
		});
		return promise;
	}

	private printPu(pu: defs.LeaderBoardPU): void {
		console.info('======= LEADERBOARD BEGIN =====')
		console.info('   contestants: ' + pu.contestants.length);
		console.info('         arena: ' + pu.arenaId);
		console.info('           gym: ' + pu.gymId);
		console.info('      duration: ' + pu.durationType);
		pu.contestants.forEach((contestant) => {
			console.info('  *** CONTESTANT ***')
			console.info('      username: ' + contestant.username);
			console.info('        points: ' + contestant.points);
			console.info('	        rank: ' + contestant.rank);
			console.info('     last rank: ' + contestant.lastRank);
			console.info('   last update: ' + contestant.lastUpdated);
		});
		console.info('====== LEADERBOARD END ======');
	}

	private calculateLBPU(contestantsList: defs.ContestantRank[], newData: defs.SensorDatum[]): defs.LeaderBoardPU {
		// 1. create a new contestants array with the new user count.
		const ourContestant = contestantsList.find((existingContestant: defs.ContestantRank) => {
			const storedId = existingContestant.memberId;
			const newId = this.userStorage.getMemberEssentials().id;
			const isMatch = (storedId === newId);
			return isMatch;
		});

		if (ourContestant) {
			console.log('Found our contestant');
			ourContestant.points = this.calculate(newData);
		} else {
			console.log('Adding a new contestant');
			const newContestant: defs.ContestantRank = {
				username: this.userStorage.getMemberEssentials().username,
				lastRank: LeaderBoardManager.VERY_LOW_RANK,
				rank: LeaderBoardManager.VERY_LOW_RANK,
				memberId: this.userStorage.getMemberEssentials().id,
				points: this.calculate(newData),
				lastUpdated: new Date()
			};
			contestantsList.push(newContestant);
		}

		// 2. sort the array
		const sortedContestants = contestantsList.sort((a, b) => {
			const diff: number = (a.points - b.points);
			return -Math.sign(diff);
		});

		// 3. fix the rankings/lastRankings.
		sortedContestants.forEach((contestant: defs.ContestantRank, index: number) => {
			const now = new Date();
			const newRank: number = index + 1;
			const oldRank: number = contestant.rank;
			const rankChanged: boolean = (newRank != oldRank);
			const beenTooLongSinceLastChange: boolean = Math.abs(contestant.lastUpdated.getTime() - now.getTime()) > 24 * 60 * 60 * 1000;

			console.info('beentoolongsincelastchange = ' + beenTooLongSinceLastChange + ' for ' + contestant.lastUpdated + ' vs now ' + now);

			if (rankChanged || beenTooLongSinceLastChange) {
				contestant.rank = newRank;
				contestant.lastRank = oldRank;
				contestant.lastUpdated = now;
			}
			contestant.rank = newRank;
		});

		// Finish wrapping up the whole thing:
		const pu: defs.LeaderBoardPU = {
			arenaId: this.configuration.arenaId,
			gymId: this.configuration.gymId,
			durationType: this.durationType,
			contestants: sortedContestants
		}

		return pu;
	}

	private calculate(newUserData: defs.SensorDatum[]): number {
		switch (this.durationType) {
			case defs.DurationType.DAY:
				return this.userStorage.calculateStepsForDay(newUserData);
			case defs.DurationType.WEEK:
				return this.userStorage.calculateStepsForWeek(newUserData);
			case defs.DurationType.MONTH:
				return this.userStorage.calculateStepsForMonth(newUserData);
			default:
				return 0;
		}
	}

	private calculateInitialLBPU(contestantData: defs.SensorDatum[]): defs.LeaderBoardPU {
		const contestantRank: defs.ContestantRank = {
			username: this.userStorage.getMemberEssentials().username,
			lastRank: LeaderBoardManager.INITIAL_RANK,
			rank: 1,
			memberId: this.userStorage.getMemberEssentials().id,
			points: this.calculate(contestantData),
			lastUpdated: new Date()
		}
		console.info('Calculated points is ' + contestantRank.points);

		const pu: defs.LeaderBoardPU = {
			arenaId: this.configuration.arenaId,
			gymId: this.configuration.gymId,
			durationType: this.durationType,
			contestants: [contestantRank]
		}

		return pu;
	}
}
