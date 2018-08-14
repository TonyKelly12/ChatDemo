export interface newUser{
	email:string,
	password:string
}

export interface User {
	uid: string,
	email: string,
	username?: string,
	first_name?: string,
	last_name?: string,
	phone?: string,
	feedRef?: string,
	photoURL?: string,
	creationTime?: string,
	lastSignInTime?: string,
	roles: Role,
	status: string
};

export interface Role{
	user?:boolean;
	pro?:boolean;
	staff?:boolean;
	admin?:boolean;
	
}

export interface Message{
    messageID:string;
    chatID: string;
    fromUID: string;
    message: string;
    photoURL: string;
    relTime: string;
    time:number;
    username:string;
}
export interface NewGym {
	city: string;
	country_iso_code: string;
	description: string;
	gym_phone_number_00: string;
	gym_phone_number_01: string;
	long_name: string;
	short_name: string;
	state: string;
	street_address: string;
	zip_code: number;
	gymID: string;
	arenaRefs: NewArena[];
};

export interface NewArena {
	gymRef: string;
	name: string;
	arenaId: string;
};

export interface NewChallenge {
	date_end?: string;
	date_start: string;
	description: string;
	name: string;
	reward_points: number;
	step_goal: number;
	type: string;

};

export interface NewFeed {
	date_end?: string;
	date_start: string;
	description: string;
	name: string;
	type: string;
	userRef: string;
	teamRefs: string;
	gymRefs: string;

};

export interface NewTeam {
	date_end?: string;
	date_start: string;
	description: string;
	name: string;
	feedRefs: string;
	gymRefs: string;
	type: string;
	gymID: string;

};

export interface Chat {
	chatID: string;
	lastMessage: {};
	members: object;
	time: string;
	createdBy: string;
	photoURL: object;
};
