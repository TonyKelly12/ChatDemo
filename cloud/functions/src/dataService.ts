import * as int from './interfaces';

// Required for side-effects


export function newUser(): int.NewUser {

	return {
		uid: '',
		username: '',
		email: '',
		first_name: '',
		last_name: '',
		phone: '',
		height: '',
		weight: '',
		isMemberOf: false,
		isStaffOf: false,
		gymID: '',
		feedRef: '',
		photoURL: '',
		creationTime: '',
		lastSignInTime: '',
		customProps: {}
	}
}

export function NewGym(): int.NewGym {
	return {
		city: '',
		country_iso_code: '',
		description: '',
		gym_phone_number_00: '',
		gym_phone_number_01: '',
		long_name: '',
		short_name: '',
		state: '',
		street_address: '',
		zip_code: 0,
		gymID: '0'

	}
}

export function NewArena(): int.NewArena {
	return {
		gymRef: '',
		name: '',
		gymID: '',
	}
}

export function NewChallenge(): int.NewChallenge {
	return {
		date_end: '',
		date_start: '',
		description: '',
		name: '',
		reward_points: 0,
		step_goal: 0,
		type: '',
	}
}

export function NewFeed(): int.NewFeed {
	return {
		key: '',
		date_end: '',
		date_start: '',
		description: '',
		name: '',
		type: '',
		teamRef: '',
		gymRef: '',
		userRef: ''
	}
}

export function NewTeam(): int.NewTeam {
	return {
		date_end: '',
		date_start: '',
		description: '',
		name: '',
		feedRefs: '',
		gymRefs: '',
		type: '',
		gymID: 'jim000bot',

	}
}

export function makeKey() {
	let key = "";
	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (let i = 0; i < 16; i++)
		key += possible.charAt(Math.floor(Math.random() * possible.length));

	return key;
}
