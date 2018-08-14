import * as firebase from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as defs from './interfaces';
import * as dataStorage from './user-data';
import * as lb from './leaderboard';

const db: FirebaseFirestore.Firestore = admin.firestore();
// require('cors')({ origin: true });

/**
 * For future reference:
 * export declare type FunctionsErrorCode =  'ok' | 'cancelled' | 'unknown' | 'invalid-argument' |  'deadline-exceeded' | 'not-found'
 * | 'already-exists' | 'permission-denied' | 'resource-exhausted' |  'failed-precondition' | 'aborted' | 'out-of-range' | 'unimplemented' | 'internal'
 * | 'unavailable' |  'data-loss' | 'unauthenticated';
 */


/**
 * Used to upload step information to the server.
 * @param  (request [description]
 * @return          [description]
 */
export const uploadStepsData = firebase.https.onCall((request: defs.SensorDataUploadRequest, context: firebase.https.CallableContext) => {
	if (!context.auth) {
		throw new firebase.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
	}
	if (context.auth.uid !== request.configuration.memberId) {
		console.error('Mismatched authentication uid to input memberId');
		throw new firebase.https.HttpsError('invalid-argument', 'The requested memberId does not match the authenticated uid');
	}

	if (!isInputContainProperSyntax("request.configuration", request.configuration) ||
		!isInputContainProperSyntax("request.data", request.data) ||
		!isInputContainProperSyntax("request.configuration.memberId", request.configuration.memberId) ||
		!isInputContainProperSyntax("request.configuration.arenaId", request.configuration.arenaId) ||
		!isInputContainProperSyntax("request.configuration.gymId", request.configuration.gymId)) {

		console.error('Missing required argument');
		throw new firebase.https.HttpsError('invalid-argument', 'One or more arguments are incorrect or missing');
	}
	console.log('User authenicated (' + context.auth.uid + '). Beginning processing');
	const userStorage = new dataStorage.UserHealthDataManager(request.configuration, db);
	userStorage.storeOrUpdateData(request.data).then(() => {

		const leaderBoardGeneratorMonth = new lb.LeaderBoardManager(defs.DurationType.MONTH, request.configuration, db, userStorage);
		const leaderBoardGeneratorWeek = new lb.LeaderBoardManager(defs.DurationType.WEEK, request.configuration, db, userStorage);
		const leaderBoardGeneratorDay = new lb.LeaderBoardManager(defs.DurationType.DAY, request.configuration, db, userStorage);

		return leaderBoardGeneratorMonth.generateAndPersist(request.data).then((_lb1) => {
			return leaderBoardGeneratorWeek.generateAndPersist(request.data).then((_lb2) => {
				return leaderBoardGeneratorDay.generateAndPersist(request.data).then((_lb3) => {
					return {
						message: 'Success!'
					};
				});
			});
		}).catch((error) => {
			console.error('At 1: ' + error);
			throw new firebase.https.HttpsError('internal', error);
		})
	}).catch((error) => {
		console.error('At 2: ' + error);
		throw new firebase.https.HttpsError('internal', error);
	});

	return {
		message: 'You should never see this. Please contact us and let us know if you do.'
	}
});

/**
 * Is this a valid input? If not, print an error message and return false.
 * @param  descriptor A descriptor to print along with message.
 * @param  testItem   Item to test.
 * @return            True if testItem is not undefined and not null.
 */
function isInputContainProperSyntax(descriptor: string, testItem: any): boolean {
	if (testItem === undefined || testItem === null) {
		console.error('Missing ' + descriptor + ' in request input.');
		return false;
	} else {
		return true;
	}
}
