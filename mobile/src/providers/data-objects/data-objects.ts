import { Injectable } from '@angular/core';
import * as ix from '../../interfaces';
// require("firebase/firestore");


@Injectable()
export class DataModelServiceService {

	constructor() { }
	newUser(): ix.newUser{
		return{
			email:'',
			password:''
		}
	}
	
	User(): ix.User {

		return {
			uid: '',
			username: '',
			email: '',
			first_name: '',
			last_name: '',
			phone: '',
			feedRef: '',
			photoURL: '',
			creationTime: '',
			lastSignInTime: '',
			roles:{
				user:true
			}, 
			status:'offline'
		}
	}

	newArena(): ix.NewArena {
		return { gymRef: '', name: '', arenaId: '', }

	}

	newChallenge(): ix.NewChallenge {

		return {

			date_start: '',
			description: '',
			name: '',
			reward_points: 0,
			step_goal: 0,
			type: ''
		}
	}

	newGym(): ix.NewGym {
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
			gymID: '',
			arenaRefs: []
		}
	}

	newTeam(): ix.NewTeam {

		return {

			date_start: '',
			description: '',
			name: '',
			feedRefs: '',
			gymRefs: '',
			gymID: '',
			type: ''
		}

	}

	newFeed(): ix.NewFeed {


		return {
			date_start: '',
			description: '',
			name: '',
			type: '',
			teamRefs: '',
			gymRefs: '',
			userRef: ''
		}
	}

	newChat(): ix.Chat {

		return {
			chatID: '',
			lastMessage: {},
			members: {},
			time: '',
			createdBy: '',
			photoURL: {}
		}
	}

}
