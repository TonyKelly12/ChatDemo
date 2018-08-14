import * as ix from './interfaces';

/**
 * This class stores the raw step data into the usuer profile section. It can also be used to calculate statistics.
 */
export class UserHealthDataManager {
	private static PEOPLE_ROOT_PATH = '/people';
	private user: FirebaseFirestore.DocumentReference;
	private configuration: ix.LeaderBoardConfigs;
	private db: FirebaseFirestore.Firestore;
	private member: ix.MemberEssentials;

	/**
	 * Constructor.
	 * @param configuration The configuration to use for the stored data.
	 * @param db            The firestore instance.
	 */
	constructor(configuration: ix.LeaderBoardConfigs, db: FirebaseFirestore.Firestore) {
		this.configuration = configuration;
		this.db = db;
		const userPath = UserHealthDataManager.PEOPLE_ROOT_PATH + '/' + configuration.memberId;
		this.user = this.db.doc(userPath);
	}


	/**
	 * Store the data (or update it).
	 * @param  data Data to update.
	 * @return      A promise.
	 */
	public storeOrUpdateData(data: ix.SensorDatum[]): Promise<void> {
		const promise = new Promise<void>((response, reject) => {
			this.updateMemberEssentials().then(() => {
				data.forEach((datum) => {
					const steps = this.user.collection('/steps');
					datum.startDate = new Date(datum.startDate);
					datum.endDate = new Date(datum.endDate);

					steps.where('startDate', '==', datum.startDate).get()
						.then((querySnapshot) => {
							if (querySnapshot.empty) {
								steps.add(datum).then((_docRef) => {
									response();
								}).catch((error) => {
									reject(error);
								});
							} else {
								querySnapshot.docs[0].ref.update(datum).then((_docRef) => {
									response();
								}).catch((error) => {
									reject(error);
								});
							}
						})
						.catch((error) => {
							reject('Unable to query steps: ' + error);
						});
				})
			}).catch((error) => {
				reject(error);
			});
		});

		return promise;
	}

	/**
	 * Updates the estimated creation date.
	 * @return The date that the user's profile was created.
	 */
	async updateMemberEssentials(): Promise<void> {
		this.member = await this.queryMemberEssentials();
	}

	/**
	 * Get the join date (aka document creation date), username, and memmer info.  From this, we'll assume
	 * that this is when they joined the gym.
	 * @return A Date Promise.
	 */
	private async queryMemberEssentials(): Promise<ix.MemberEssentials> {
		return await new Promise<ix.MemberEssentials>((response, reject) => {
			this.user.get().then((doc) => {
				if (doc.exists) {
					const creation = new Date(doc.createTime);
					creation.setUTCHours(0);
					creation.setUTCMinutes(0);
					creation.setUTCSeconds(0);
					creation.setUTCMilliseconds(0);

					let firstName: string = doc.data().first_name;
					if (!firstName) {
						firstName = 'Anonymous';
					}

					let lastName: string = doc.data().last_name;
					if (!lastName) {
						lastName = 'Coward';
					}

					let username: string = doc.data().username;
					const NAME_LENGTH: number = 5;
					if (!username) {
						if (firstName.length > NAME_LENGTH) {
							username = firstName[0].toUpperCase() + firstName.substr(1, NAME_LENGTH - 1).toLowerCase() + lastName[0].toUpperCase();
						} else {
							username = firstName[0].toUpperCase() + firstName.substr(1).toLowerCase() + lastName[0].toUpperCase();
						}
					}

					const member: ix.MemberEssentials = {
						username: username,
						id: this.configuration.memberId,
						joined: creation,
						firstName: firstName,
						lastName: lastName
					}

					response(member);
				} else {
					reject('No document found for member ID ' + this.configuration.memberId);
				}
			}).catch((error) => {
				reject('Unable to get first join date: ' + error);
			});
		});

	}

	/**
	 * Calculate the number of steps in the course of the month.
	 * @param  data Raw step data.
	 * @return      Number of steps.
	 */
	public calculateStepsForMonth(data: ix.SensorDatum[]): number {
		const today: Date = new Date();
		const tentativeStartDate: Date = new Date(today.getUTCFullYear(), today.getUTCMonth(), 0, 0, 0, 0, 0); // 1st of the month.
		const beginningOfMonth = UserHealthDataManager.getLaterDate(tentativeStartDate, this.member.joined);

		console.info('MONTH: Calculating range = ' + tentativeStartDate + ' (' + beginningOfMonth + ') to ' + today);

		return UserHealthDataManager.calculateStepsInPeriod(beginningOfMonth, today, data);
	}

	/**
	 * Calculate the number of steps in the course of the month.
	 * @param  data Raw step data.
	 * @return      Number of steps.
	 */

	public calculateStepsForWeek(data: ix.SensorDatum[]): number {
		const today: Date = new Date();
		const tentativeStartDate: Date = UserHealthDataManager.getBeginningOfWeek(today);

		const beginningOfWeek = UserHealthDataManager.getLaterDate(tentativeStartDate, this.member.joined);

		console.info('WEEK: Calculating range = ' + tentativeStartDate + ' (' + beginningOfWeek + ') to ' + today);

		return UserHealthDataManager.calculateStepsInPeriod(beginningOfWeek, today, data);
	}

	/**
	 * Calculate the number of steps in the course of the month.
	 * @param  data Raw step data.
	 * @return      Number of steps.
	 */
	public calculateStepsForDay(data: ix.SensorDatum[]): number {
		const now: Date = new Date();
		// no need to calculate the "later date". We are giving them the whole day.
		const beginningOfDay: Date = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0);

		console.info('DAY: Calculating range = ' + beginningOfDay + ' to ' + now);

		return UserHealthDataManager.calculateStepsInPeriod(beginningOfDay, now, data);
	}

	/**
	 * GIven two dates, return the later of the two.
	 * @param  a First date.
	 * @param  b Second date.
	 * @return   The later of the two dates.
	 */
	public static getLaterDate(a: Date, b: Date): Date {
		if (UserHealthDataManager.compareDates(a, b) > 0) {
			return a;
		} else {
			return b;
		}
	}

	/**
	 * Compare two dates.
	 * @param  a Date 1
	 * @param  b Date 2
	 * @return   0, 1, -1 to denote equality, a>b, a<b, respectively
	 */
	public static compareDates(a: Date, b: Date): number {
		const diff = a.getTime() - b.getTime();
		return Math.sign(diff);
	}

	/**
	 * For a given SensorDatum array, calculate the total number of steps taken this month.
	 * @param  data A SensorDatum[] instance.
	 * @return      The total number of steps taken this month..
	 */
	private static calculateStepsInPeriod(periodStartDate: Date, periodEndDate: Date, data: ix.SensorDatum[]): number {
		const INITIAL_VALUE = 0;

		console.info('==> Calculating steps from ' + periodStartDate + ' to ' + periodEndDate);

		const value: number = data.filter((item) => {
			const itemDate = new Date(item.startDate);
			const isIncluded = (this.compareDates(periodStartDate, itemDate) <= 0) && (this.compareDates(itemDate, periodEndDate) <= 0)
			return isIncluded;
		}).map((item) => {
			return item.value;
		}).reduce((prev, curr) => {
			return prev + curr;
		}, INITIAL_VALUE);

		return value;
	}

	/**
	 * For a given date, return the beginning of the week (Sunday)
	 * @param  date Test Date.
	 * @return      The Sunday prior to the date.
	 */
	private static getBeginningOfWeek(date: Date): Date {
		const d = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0);
		const day = d.getUTCDay();
		const diff = d.getUTCDate() - day;
		return new Date(d.setUTCDate(diff));
	}

	/**
	 * Get the MemberEssentials for this member.
	 * @return A MemberEssentials instance.
	 */
	public getMemberEssentials(): ix.MemberEssentials {
		return this.member;
	}

}
