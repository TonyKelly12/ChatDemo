import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import * as ix from '../../interfaces';
import firebase from 'firebase/app';

export enum ProfileVisibility {
  public  = 'public',
  friends = 'friends',
  private = 'private'
};

class Profile {
	username: string;
	photoURL: string;
	shortBio: string;
	first_name: string;
	last_name: string;
	birthDate: string;
	height: string;
	weight: string;
	alias: string;
	profileVisibility: ProfileVisibility;
};
export class UserProfile extends Profile { id: string; };

@Injectable()
export class ProfileData {
	private peopleDocumentRef: AngularFirestoreDocument<UserProfile>;

	constructor(private afs: AngularFirestore) {
	}

	public getProfileData(user: firebase.User): Observable<UserProfile> {
		this.peopleDocumentRef = this.afs.doc('/people/' + user.uid);

		return this.peopleDocumentRef.snapshotChanges().map(action => {
			const data = action.payload.data() as Profile;
			const id = action.payload.id;
			return { id, ...data };
		});
	}
}
