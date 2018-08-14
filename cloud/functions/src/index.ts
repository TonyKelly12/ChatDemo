import * as functions from 'firebase-functions';
import * as dataService from './dataService';
import * as int from './interfaces';

//**NEEDED TO INIT FIREBASE */
require('cors')({
	origin: true
});        // CORS
const admin = require('firebase-admin');  // FIRESTORE
admin.initializeApp();

// ADD LEADERBOARD FUNCTIONS
export * from './leaderboard/functions';

//const cors = require('cors')({origin: true});
//import { DataSnapshot } from 'firebase-functions/lib/providers/database';
//import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument} from 'angularfire2/firestore';
//import {Observable} from 'rxjs/Observable';
//import 'rxjs/add/operator/audit.js.map';
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

//COLLECTIONS REFS//

const Gyms = admin.firestore().collection('gyms');
const Teams = admin.firestore().collection('teams');
const People = admin.firestore().collection('people');
const Init = admin.firestore().collection('init');
const Chats = admin.firestore().collection('chats');

export const helloWorld = functions.https.onRequest((_request, response) => {
	response.send("Hello from Firebase!");
});

////******** ALL POST REQUEST *//////////



//**Called when new user is created from app */
export const initPerson = functions.auth.user().onCreate((user) => {
	let initGymKey;
	const initGymID = 'jim000bot';
	const userData: int.NewUser = dataService.newUser();
	userData.uid = user.uid;
	userData.email = user.email;
	userData.gymID = initGymID;
	if (user.displayName !== null || user.displayName !== undefined) {
		userData.username = user.displayName
	};
	if (user.photoURL !== null || user.displayName !== undefined) {
		userData.photoURL = user.photoURL;
	}
	if (user.photoURL === null || user.photoURL === undefined || user.photoURL === '') {
		userData.photoURL = ''
	}
	initFeed(user.uid, initGymID)
	// sets user in firestore
	return People.doc(user.uid).set(userData)
		.catch(_err => {
			
		}).then(
			// gets gym by gymID
			Gyms.where('gymID', '==', userData.gymID).get()
				.then((snapshot) => {
					snapshot.forEach(doc => {

						const gym = doc.data();
						initGymKey = gym.key;
						//sets user in gym under members
						Gyms.doc(initGymKey).collection('members').doc(userData.uid).set(userData);
					});
				}).catch(_err => {
					
				})
		).catch(_err => {
			console.log('error getting gym key')
		}).then(() => {

			initChat(user.uid)
			initFriend(user.uid);
		}).catch(err => console.log('error init chat', err))
});

//** Called after initer person,gym, or arena to init and assign a feed */
function initFeed(userID, initGymID) {
	const feedKey = dataService.makeKey();
	const feedData: int.NewFeed = {
		key: feedKey,
		userRef: userID,
		gymRef: initGymID,
		name: 'personal feed',
		type: 'user feed',
		description: "users feed created during registeration"
	};
	return admin.firestore().collection('feeds').add(feedData)


}

function initChat(userID) {
	Init.doc('welcomeMessage').get()
		.then(doc => {
			const welcomeChat = doc.data();
			welcomeChat.members.push(userID);
			return People.doc(userID).collection('chats').add(welcomeChat)
				.then((res) => {
					const chatID = res.id;
					let myWelcomeChat = res.data();
					myWelcomeChat.chatID = chatID;
					const welcomeMessage = {
						meesage: "your message here",
						photoURL: "your photo here",
						time: "No better time to start than now!"
					}
					People.doc(userID).collection('chats').doc(res.id).set(welcomeChat)
					People.doc(userID).collection('chats').doc(res.id).collection('messages').add(welcomeMessage);
				});
		})
}

function initFriend(userID) {
	const Firend = Init.doc('jimthebot').get()
		.then(doc => {
			const friend = doc.data()
			return People.doc(userID).collection('friendsList').add(friend);
		})
}

export const onFeedCreate = functions.firestore.document('feeds/{key}').onCreate((snap, context) => {


	const feed = snap.data();

	People.doc(feed.userRef).get()
		.then((snapshot) => {
			snapshot.forEach(person => {
				person.feedRef = feed.key;
				console.log('feedkey')
				console.log(person.feedRef);
			});
		})
		.catch(err => {
			console.log('error setting feedRef key')
		})
		.then(
			Gyms.where('gymID', '==', feed.gymRef).get()
				.then((snapshot) => {
					snapshot.forEach(doc => {

						const gym = doc.data();
						const gymKey = doc.id
						console.log('gym real Key')
						console.log(gymKey);
						return Gyms.doc(gymKey).collection('feedRefs').add(feed);
						//sets user in gym under members

					});
				}).catch(err => {
					console.log('error getting gym key')
				})
		).catch(err => {
			console.log('error getting gym key')
		})

});

export const onDeviceCreate = functions.firestore.document('devices/{token}').onCreate((snap, context) => {
	const device = snap.data();

	console.log(device);
	return People.doc(device.userID).collection('devices').doc(device.token).set(device);
});

export const onFriendRequestApproved = functions.firestore.document('people/{uid}/approvedFriendRequestSent/{key}').onCreate(async event => {

	const data = event.data();
	const db = admin.firestore();

	console.log('data: ', data)
	const userID = data.senderID;

	const receiverRef = db.collection('people').doc(data.approverID).get()
		.then(doc => {
			if (!doc) {
				console.log('no such document in request received')
			} else {
				const receiver = doc.data();

				db.collection('people').doc(data.senderID).collection('friendsList').doc(data.approverID).set(receiver)
				sendFriendToast(receiver, data).then((value) => {
					console.log('Toast sent successfully: ' + value);
				}).catch((error) => {
					console.error(error);
				});
			}
		}).catch((error) => {
			console.error(error);
		});

});

async function sendFriendToast(receiver, data) {
	const db = admin.firestore();
	const userID = data.senderID;
	//get user tokesn and send notification
	const deviceRef = db.collection('devices').where('userID', '==', userID);
	let token;
	const devices = await deviceRef.get();
	devices.forEach(result => {
		const deviceRefs = result.data();
		console.log('deviceRef: ', deviceRefs);
		token = deviceRefs.token;
	});;

	const message = {
		notification: {
			title: "New Friend",
			body: "You & " + receiver.first_name + " " + receiver._lastname + " are now friends!"
		},
		token: token,
		android: {
			ttl: 4000,
			priority: 'normal',
		},
		apns: {
			payload: {
				aps: {
					badge: 0,
				},
			},
		}
	};
	//send notifications
	console.log('message', message)
	//send notifications
	return admin.messaging().send(message)
		.then((response) => {
			// Response is a message ID string.
			console.log('run successful:', response);
		})
		.catch((error) => {
			console.log('Error during  run:', error);
		});
};

export const onFriendRequest = functions.firestore.document('people/{uid}/pendingFriendRequest/{key}').onCreate(async event => {
	const data = event.data();
	console.log('data: ', data)
	const userID = data.sentTo
	const name = data.sender.first_name + ' ' + data.sender.last_name;



	const db = admin.firestore();
	const deviceRef = db.collection('devices').where('userID', '==', userID);

	//get user tokesn and send notification
	const devices = await deviceRef.get()

	let token;

	devices.forEach(result => {
		const deviceRefs = result.data();
		console.log('deviceRef: ', deviceRefs);
		token = deviceRefs.token


	});
	console.log(token, 'token')
	const message = {
		notification: {
			title: "New Friend",
			body: "You have a friend Request from " + name,

		},

		token: token,
		android: {
			ttl: 4000,
			priority: 'normal',
			notification: {
				icon: data.sender.photoURL
			}
		},
		apns: {
			payload: {
				aps: {
					badge: 0,
				},
			},
		}
	}
	console.log('message', message)
	//send notifications
	return admin.messaging().send(message)
		.then((response) => {
			// Response is a message ID string.
			console.log('run successful:', response);
		})
		.catch((error) => {
			console.log('Error during  run:', error);
		});
});
// ALL Delete Methods

export const deleteUser = functions.firestore
	.document('people/{userID}')
	.onDelete((snap, context) => {
		// Get an object representing the document prior to deletion
		// e.g. {'name': 'Marie', 'age': 66}
		const deletedValue = snap.data();
		console.log(deletedValue);
		// perform desired operations ...
	});

export const deleteApprovedFriendRequest = functions.firestore
	.document('people/{userID}/pendingFriendRequest/{key}')
	.onDelete((snap, context) => {
		// Get an object representing the document prior to deletion
		// e.g. {'name': 'Marie', 'age': 66}
		const deletedValue = snap.data();
		console.log(deletedValue);
		// perform desired operations ...
		People.doc(deletedValue.sender.uid).collection('friendRequestSent').doc(deletedValue.key).delete();
		let personRef = People.doc(deletedValue.sentTo)
		let getPerson = personRef.get()
			.then(person => {
				if (!person.exists) {
					console.log('cant find doc');
				} else {
					const friend = person.data();
					return People.doc(deletedValue.sender.uid).collection('friendsList').doc(friend.uid).set(friend);
				}
			}).catch(err => {
				console.log('Error getting document', err);
			});




	});

//All Update Methods
export const updateUser = functions.firestore
	.document('people/{userId}')
	.onUpdate((change, context) => {
		// Get an object representing the document
		// e.g. {'name': 'Marie', 'age': 66}
		const newValue = change.after.data();

		// ...or the previous value before this update
		const previousValue = change.before.data();

		// access a particular field as you would any JS property
		const name = newValue.name;
		console.log(name);
		// perform desired operations ...
		return name
	});

//**CHAT Functions */
export const newChatSession = functions.firestore.document('people/{uid}/chats/{chatID}').onCreate(async event => {
	const eventID = event.id
	let chatSession = event.data();
	console.log('event', event)

	chatSession.chatID = eventID
	console.log('chatSession', chatSession)
	return People.doc(chatSession.createdBy).collection('chats').doc(chatSession.chatID).update({ chatID: chatSession.chatID });
})

export const newMessage = functions.firestore.document('chats/{chatID}/messages/{messageID}').onCreate(async event => {
	const db = admin.firestore();
	const data = event.data();
	console.log('data: ', data)
	const toUID = data.toUID
	const text = data.message;
	const sender = data.username


	if (data.time === 'No better time to start than now!') {
		return
	}

	//Get the Chat session associated with message
	const chatSession = Chats.doc(data.chatID);
	chatSession.get()
		.then((doc) => {
			if (doc.exists) {
				let chat = doc.data();
				let membersArray = []
				//loop thorough each member in the chat
				chat.members.forEach(async member => {
					People.doc(member).collection('chats').doc(data.chatID).collection('messages').add(data);

					console.log('member', member)
					//get every device associated with the member in chat
					const deviceRef = db.collection('devices').where('userID', '==', member);
					const devices = await deviceRef.get()
					let token;
					// loop through each device and send message to user.
					devices.forEach(result => {
						const deviceRefs = result.data();
						console.log('deviceRef: ', deviceRefs);
						//set the users msg auth token
						if (deviceRefs.token) {
							token = deviceRefs.token
							console.log(token, 'token')
							//set the toast message to send to
							const message = {
								notification: {
									title: "New Message",
									body: 'Message from ' + sender + ':' + text,
								},

								token: token,
								android: {
									ttl: 4000,
									priority: 'normal',
									notification: {
										icon: data.photoURL
									}
								},
								apns: {
									payload: {
										aps: {
											badge: 0,
										},
									},
								}
							};
							console.log('message', message)
							//send notifications
							admin.messaging().send(message)
								.then((response) => {
									// return the response to end function.
									console.log('run successful:', response);
									return;
								})
								.catch((error) => {
									console.log('Error during  run:', error);
								});
						}

					});

				});
			}
		})
});

export const syncChat = functions.firestore.document('chats/{chatID}').onWrite(event => {
	const data = event.after.data();
	const membersArray = data.members;

	membersArray.forEach(member => {
		People.doc(member).collection('chats').doc(data.chatID).set(data);
	});
	console.log(data)
	return data;

});


//**Called when a new STAFF is created from managers portal**
export const newStaff = functions.https.onRequest((req, res) => {
	//getts ref to gym collection and feeds collection
	const getFeeds = admin.firestore().collection('feeds');
	const getGyms = admin.firestore().collection('gyms');

	///Creats a new user object
	const staff = dataService.newUser();
	const userFeed = dataService.NewFeed();
	userFeed.userRef = req.body.uid
	///Replaces blank staff user with info received in req.body
	let staffData = Object.assign({}, staff, req.body);
	console.log("staffData " + staffData)
	console.log("staffData below ")

	////Pulls person just created in auth by the req.body.uid
	admin.firestore().collection('people').doc(req.body.uid).set(staffData)
		.then(admin.firestore().collection('feeds').doc().set(userFeed))
		.catch(err => {
			console.log('Error getting documents', err);
		})
		.then(getFeeds.get())
		.catch(err => {
			console.log('Error getting documents', err);
		})
		.then(
			///Loops through each feed to match user and adds to users feedRef
			FeedRefs => {
				FeedRefs.forEach(feed => {
					if (feed._fieldsProto.userRef.stringValue === req.body.uid) {
						console.log('feed ran!');
						admin.firestore().collection('people').doc(req.body.uid).update({ feedRef: feed.uid });
					}
				}).catch(err => {
					console.log('Error looping through feeds');
				});
			}
		).catch(err => {
			console.log('Error getting documents', err);
		});
	////Gets all members in gym, loops through and compares gymID
	///If it matches it addes it to memebers and staff by default
	const allGyms = getGyms.get()
		.catch(err => { console.log('Error getting gyms') })
		.then(GymRefs => {
			GymRefs.forEach(gym => {
				console.log(gym._fieldsProto.gymID.stringValue)
				//console.log(staff.gymID)
				if (gym._fieldsProto.gymID.stringValue === '303') {
					console.log('It ran!');
					admin.firestore().collection('gyms').doc(gym.id).collection('members').doc().set(staffData)
						.then(admin.firestore().collection('gyms').doc(gym.id).collection('staff').doc().set(staffData)
						).catch(err => {
							console.log('Error getting documents', err);
						})
				}
				return res.send(staffData);
			});
		}).catch(err => {
			console.log('Error getting documents', err);
		});
});

//**Called when a new ARENA is created**
export const newArena = functions.https.onRequest((req, res) => {
	const getGyms = admin.firestore().collection('gyms');
	let arena = dataService.NewArena()
	let allGyms = [];
	let arenaData = Object.assign({}, arena, req.body);
	admin.firestore().collection('arenas').doc().set(arenaData)
		.catch(err => {
			console.log('Error saving arena', err);
		})
		.then(getGyms.get()
			.catch(err => { console.log('Error getting gyms') })
			.then(GymRefs => {
				GymRefs.forEach(gym => {
					console.log(gym._fieldsProto.gymID.stringValue)
					//console.log(staff.gymID)
					if (gym._fieldsProto.gymID.stringValue === req.body.gymID) {
						console.log('arena It ran!');
						admin.firestore().collection('gyms').doc(gym.id).collection('arenaRefs').doc().set(arenaData)
							.catch(err => {
								console.log('Error setting areaRef for gym', err);
							})
					}
					return res.send(arenaData);
				});
			}).catch(err => {
				console.log('Error looping gyms', err);
			})
		).catch(err => {
			console.log('Error in updating arena gyms')
		});

});

//**Called when a new CHALLENGE is created**
export const newChallenge = functions.https.onRequest((req, res) => {
	const getGyms = admin.firestore().collection('gyms');
	let challenge = dataService.NewChallenge();
	let allGyms = [];
	let challengeData = Object.assign({}, challenge, req.body);
	admin.firestore().collection('challenges').doc().set(challengeData)
		.catch(err => {
			console.log('Error saving challenge', err);
		})
		.then(getGyms.get()
			.catch(err => { console.log('challenge Error getting gyms') })
			.then(GymRefs => {
				GymRefs.forEach(gym => {
					console.log(gym._fieldsProto.gymID.stringValue)
					//console.log(staff.gymID)
					if (gym._fieldsProto.gymID.stringValue === req.body.gymID) {
						console.log('challenge It ran!');
						admin.firestore().collection('gyms').doc(gym.id).collection('challengeRefs').doc().set(challengeData)
							.catch(err => {
								console.log('Error setting challengeRef for gym', err);
							})
					}
					return res.send(challengeData);
				});
			}).catch(err => {
				console.log('challenge Error looping gyms', err);
			})
		).catch(err => {
			console.log('challenge Error in updating arena gyms')
		});

});
//**Called when a new TEAM is created**
export const newTeam = functions.https.onRequest((req, res) => {
	const getGyms = admin.firestore().collection('gyms');
	let team = dataService.NewTeam();
	let allGyms = [];
	let teamData = Object.assign({}, team, req.body);
	admin.firestore().collection('teams').doc().set(teamData)
		.catch(err => {
			console.log('Error saving team', err);
		})
		.then(getGyms.get()
			.catch(err => { console.log('team Error getting gyms') })
			.then(GymRefs => {
				GymRefs.forEach(gym => {
					console.log(gym._fieldsProto.gymID.stringValue)
					//console.log(staff.gymID)
					if (gym._fieldsProto.gymID.stringValue === req.body.gymID) {
						console.log('team It ran!');
						admin.firestore().collection('gyms').doc(gym.id).collection('teamRefs').doc().set(teamData)
							.catch(err => {
								console.log('Error setting teameRef for gym', err);
							})
					}
					return res.send(teamData);
				});
			}).catch(err => {
				console.log('team Error looping gyms', err);
			})
		).catch(err => {
			console.log('team Error in updating team gyms')
		});

});

//**Called when a new GYM is created**
export const newGym = functions.https.onRequest((req, res) => {
	const getGyms = admin.firestore().collection('gyms');
	let gym = dataService.NewGym();
	let allGyms = [];
	let gymData = Object.assign({}, gym, req.body);
	admin.firestore().collection('gyms').doc().set(gymData)
		.catch(err => {
			console.log('Error saving team', err);
		});
	return res.send(gymData);

});

/////////**** ALL GET REQUEST*////////////

//GET GYMS//
export const getAllGymsByCity = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const gymsArray = [];
	const gymsQuery = Gyms.where('city', '==', req.query.city).get().catch(err => {
		console.error('error fetching by city')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((gym) => {
				console.log(gym.data())
				const gymRef = gym.data();
				gymsArray.push(gymRef);
			})
			return res.send(gymsArray);
		}).catch(err => {
			console.error(err)
		})
});

export const getAllGymsByID = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const gymsArray = []
	const gymsQuery = Gyms.where('gymID', '==', req.query.gymID).get().catch(err => {
		console.error('error fetching by gymID')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((gym) => {
				console.log(gym.data())
				const gymRef = gym.data();
				gymsArray.push(gymRef);
			})
			return res.send(gymsArray);
		}).catch(err => {
			console.error(err)
		})
});

export const getAllGymsByLongName = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const gymsArray = []
	const gymsQuery = Gyms.where('long_name', '==', req.query.long_name).get().catch(err => {
		console.error('error fetching by long_name')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((gym) => {
				console.log(gym.data())
				const gymRef = gym.data();
				gymsArray.push(gymRef);
			})
			return res.send(gymsArray);
		}).catch(err => {
			console.error(err)
		})
});

export const getAllGymsByShortName = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const gymsArray = []
	const gymsQuery = Gyms.where('short_name', '==', req.query.short_name).get().catch(err => {
		console.error('error fetching by short_name')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((gym) => {
				console.log(gym.data())
				const gymRef = gym.data();
				gymsArray.push(gymRef);
			})
			return res.send(gymsArray);
		}).catch(err => {
			console.error(err)
		})
});

export const getAllGymsByZip = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const gymsArray = []
	const gymsQuery = Gyms.where('zip_code', '==', req.query.zip_code).get().catch(err => {
		console.error('error fetching by zip')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((gym) => {
				console.log(gym.data())
				const gymRef = gym.data();
				gymsArray.push(gymRef);
			})
			return res.send(gymsArray);
		}).catch(err => {
			console.error(err)
		})
});

export const getAllGymsByCountryCode = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const gymsArray = []
	const gymsQuery = Gyms.where('country_iso_code', '==', req.query.country_iso_code).get().catch(err => {
		console.error('error fetching by country code')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((gym) => {
				console.log(gym.data())
				const gymRef = gym.data();
				gymsArray.push(gymRef);
			})
			return res.send(gymsArray);
		}).catch(err => {
			console.error(err)
		})
});

export const getAllGymsByState = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const gymsArray = []
	const gymsQuery = Gyms.where('state', '==', req.query.state).get().catch(err => {
		console.error('error fetching by state')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((gym) => {
				console.log(gym.data())
				const gymRef = gym.data();
				gymsArray.push(gymRef);
			})
			return res.send(gymsArray);
		}).catch(err => {
			console.error(err)
		})
});

//GET PEOPLE//
export const getAllPeopleByFirstName = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const peopleArray = []
	const peopleQuery = People.where('first_name', '==', req.query.first_name).get().catch(err => {
		console.error('error fetching by state')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((user) => {
				console.log(user.data())
				const userRef = user.data();
				peopleArray.push(userRef);
			})
			return res.send(peopleArray);
		}).catch(err => {
			console.error(err)
		})
});

export const getAllPeopleByLastName = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const peopleArray = []
	const peopleQuery = People.where('last_name', '==', req.query.last_name).get().catch(err => {
		console.error('error fetching by state')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((user) => {
				console.log(user.data())
				const userRef = user.data();
				peopleArray.push(userRef);
			})
			return res.send(peopleArray);
		}).catch(err => {
			console.error(err)
		})
});

export const getAllPeopleByPhone = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const peopleArray = []
	const peopleQuery = People.where('phone_number', '==', req.query.phone_number).get().catch(err => {
		console.error('error fetching by state')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((user) => {
				console.log(user.data())
				const userRef = user.data();
				peopleArray.push(userRef);
			})
			return res.send(peopleArray);
		}).catch(err => {
			console.error(err)
		})
});

export const getAllMembers = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const peopleArray = []
	const peopleQuery = People.where('isMemberOf', '==', true).get().catch(err => {
		console.error('error fetching by state')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((user) => {
				console.log(user.data())
				const userRef = user.data();
				peopleArray.push(userRef);
			})
			return res.send(peopleArray);
		}).catch(err => {
			console.error(err)
		})
});

export const getAllStaff = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const peopleArray = []
	const peopleQuery = People.where('isStaffOf', '==', true).get().catch(err => {
		console.error('error fetching by state')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((user) => {
				console.log(user.data())
				const userRef = user.data();
				peopleArray.push(userRef);
			})
			return res.send(peopleArray);
		}).catch(err => {
			console.error(err)
		})
});

export const getUserByUID = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const peopleArray = []
	const peopleQuery = People.where('uid', '==', req.query.uid).get().catch(err => {
		console.error('error fetching by state')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((user) => {
				console.log(user.data())
				const userRef = user.data();
				peopleArray.push(userRef);
			})
			return res.send(peopleArray);
		}).catch(err => {
			console.error(err)
		})
});

export const getUserByUsername = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const peopleArray = []
	const peopleQuery = People.where('username', '==', req.query.username).get().catch(err => {
		console.error('error fetching by state')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((user) => {
				console.log(user.data())
				const userRef = user.data();
				peopleArray.push(userRef);
			})
			return res.send(peopleArray);
		}).catch(err => {
			console.error(err)
		})
});

export const getUserByEmail = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const peopleArray = []
	const peopleQuery = People.where('email', '==', req.query.email).get().catch(err => {
		console.error('error fetching by state')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((user) => {
				console.log(user.data())
				const userRef = user.data();
				peopleArray.push(userRef);
			})
			return res.send(peopleArray);
		}).catch(err => {
			console.error(err)
		})
});

export const getWeightGreaterThan = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const peopleArray = []
	const peopleQuery = People.where('weight', '>=', req.query.weight).get().catch(err => {
		console.error('error fetching by state')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((user) => {
				console.log(user.data())
				const userRef = user.data();
				peopleArray.push(userRef);
			})
			return res.send(peopleArray);
		}).catch(err => {
			console.error(err)
		})
});

export const getWeightLessThan = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const peopleArray = []
	const peopleQuery = People.where('weight', '<=', req.query.weight).get().catch(err => {
		console.error('error fetching by state')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((user) => {
				console.log(user.data())
				const userRef = user.data();
				peopleArray.push(userRef);
			})
			return res.send(peopleArray);
		}).catch(err => {
			console.error(err)
		})
});

export const getHeightGreaterThan = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const peopleArray = []
	const peopleQuery = People.where('height', '>=', req.query.height).get().catch(err => {
		console.error('error fetching by state')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((user) => {
				console.log(user.data())
				const userRef = user.data();
				peopleArray.push(userRef);
			})
			return res.send(peopleArray);
		}).catch(err => {
			console.error(err)
		})
});

export const getHeightLessThan = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const peopleArray = []
	const peopleQuery = People.where('height', '<=', req.query.height).get().catch(err => {
		console.error('error fetching by state')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((user) => {
				console.log(user.data())
				const userRef = user.data();
				peopleArray.push(userRef);
			})
			return res.send(peopleArray);
		}).catch(err => {
			console.error(err)
		})
});

//Friends List
export const getUserFriends = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const friendsArray = []
	const friendsQuery = People.doc(req.query.uid).collection('friendsList').get().catch(err => {
		console.error('error fetching by state')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((friend) => {
				console.log(friend.data())
				const friendRef = friend.data();
				friendsArray.push(friendRef);
			})
			return res.send(friendsArray);
		}).catch(err => {
			console.error(err)
		})
});


//GET TEAMS//
export const getTeamByName = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const teamArray = []
	const teamQuery = Teams.where('name', '==', req.query.name).get().catch(err => {
		console.error('error fetching by state')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((team) => {
				console.log(team.data())
				const teamRef = team.data();
				teamArray.push(teamRef);
			})
			return res.send(teamArray);
		}).catch(err => {
			console.error(err)
		})
});

export const getTeamByGymID = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const teamArray = []
	const teamQuery = Teams.where('gymID', '==', req.query.gymID).get().catch(err => {
		console.error('error fetching by state')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((team) => {
				console.log(team.data())
				const teamRef = team.data();
				teamArray.push(teamRef);
			})
			return res.send(teamArray);
		}).catch(err => {
			console.error(err)
		})
});

export const getTeamByType = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const teamArray = []
	const teamQuery = Teams.where('type', '==', req.query.type).get().catch(err => {
		console.error('error fetching by state')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((team) => {
				console.log(team.data())
				const teamRef = team.data();
				teamArray.push(teamRef);
			})
			return res.send(teamArray);
		}).catch(err => {
			console.error(err)
		})
});
///GET ARENAS///
export const getArenaByName = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const arenaArray = []
	const arenaQuery = Teams.where('name', '==', req.query.name).get().catch(err => {
		console.error('error fetching by state')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((arena) => {
				console.log(arena.data())
				const arenaRef = arena.data();
				arenaArray.push(arenaRef);
			})
			return res.send(arenaArray);
		}).catch(err => {
			console.error(err)
		})
});

export const getArenaByGymID = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const arenaArray = []
	const arenaQuery = Teams.where('gymID', '==', req.query.gymID).get().catch(err => {
		console.error('error fetching arena by id')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((arena) => {
				console.log(arena.data())
				const arenaRef = arena.data();
				arenaArray.push(arenaRef);
			})
			return res.send(arenaArray);
		}).catch(err => {
			console.error(err)
		})
});

export const getArenaByType = functions.https.onRequest((req, res) => {

	console.log('Request params');
	console.log(req.query);
	const arenaArray = []
	const arenaQuery = Teams.where('type', '==', req.query.type).get().catch(err => {
		console.error('error fetching arena by type')
	})
		.then(snapshot => {
			//console.log(snapshot)
			snapshot.forEach((arena) => {
				console.log(arena.data())
				const arenaRef = arena.data();
				arenaArray.push(arenaRef);
			})
			return res.send(arenaArray);
		}).catch(err => {
			console.error(err)
		})
});



//////****ALL POST REQUEST */
