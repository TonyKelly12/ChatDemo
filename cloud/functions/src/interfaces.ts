export interface NewUser{
    uid: string;
    email: string;
    username?:string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    height?: string;
    weight?: string;
    isMemberOf?: boolean;
    isStaffOf?: boolean;
    gymID?:string;
    feedRef?:string;
    photoURL?: string;
    creationTime?: string;
    lastSignInTime?: string;
    customProps?: {}
};

export interface NewGym{
    city:string;
    country_iso_code:string;
    description:string;
    gym_phone_number_00:string;
    gym_phone_number_01:string;
    long_name:string;
    short_name:string;
    state:string;
    street_address:string;
    zip_code:number;
    gymID:string;
    
};

export interface NewArena{
    gymRef:string;
    name: string;
    gymID:string;
    
};

export interface NewChallenge{
    date_end: string; 
    date_start: string;
    description:string;
    name:string;
    reward_points: number;
    step_goal: number;
    type: string;
    
};

export interface NewFeed{
    key?: string;
    date_end?: string; 
    date_start?: string;
    description?:string;
    name?:string;
    type?: string;
    userRef?:string;
    teamRef?: string;
    gymRef?: string;
    
};

export interface NewTeam{
    date_end: string; 
    date_start: string;
    description:string;
    name:string;
    feedRefs: string;
    gymRefs: string;
    type:string;
    gymID:string;
    
};