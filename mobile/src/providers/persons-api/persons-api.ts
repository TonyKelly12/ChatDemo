import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SportsType } from '../app-globals/app-globals';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';

// FIXME: it turns out that iOS devices do not like doing HTTP rest calls
// Since they are treated like remote websites and hence they tend to trigger
// CORS erors.  Consider converting all http calls to "onCall()" firebase native
// calls. See the leaderboard/functions.ts file inside the cloud functions,
// and the corresponding components/step-counter-card.ts file (submitDataToServer())
// within the mobile app for an example.
@Injectable()
export class PersonsApiProvider {
	private apiUrl: string = '';

	constructor(public http: HttpClient) {
	}

	getRequest(url: string): Promise<any> {
		//console.log(`GET url: ${url}`);
		return this.http.get(this.apiUrl + url).toPromise()
			.then(resp => resp)
			.catch(e => this.handleError(e, 'GET'));
	}

	postRequest(url: string, data: any): Promise<any> {
		//console.log(`POST url: ${url}, data: ${data}`);
		const headers = new HttpHeaders({
			'Content-Type': 'application/json'
		});

		return this.http.post(this.apiUrl + url, data, { headers: headers }).toPromise()
			.then(resp => resp)
			.catch(e => this.handleError(e, 'POST'));
	}

	putRequest(url: string, data: any): Promise<any> {
		//console.log(`POST url: ${url}, data: ${data}`);
		const headers = new HttpHeaders({
			'Content-Type': 'application/json'
		});

		return this.http.put(this.apiUrl + url, data, { headers: headers }).toPromise()
			.then(resp => resp)
			.catch(e => this.handleError(e, 'PUT'));
	}

	deleteRequest(url: string): Promise<any> {
		//console.log(`DELETE url: ${url}`);
		return this.http.delete(this.apiUrl + url).toPromise()
			.then(resp => resp)
			.catch(e => this.handleError(e, 'DELETE'));
	}

	handleError(error: Response, httpMethod: string) {
		console.log(`HTTP ${httpMethod} Error: ${JSON.stringify(error)}`);
		return Promise.reject(error);
	}

	/*
	 * Get a count of all available properties.
	 */
	getAvailablePropertiesCount(personID: number): Promise<number> {
		return new Promise((resolve, reject) => {
			this.getRequest(`persons/${personID}/properties/count`)
				.then(resp => resolve(resp))
				.catch(err => reject(err));
		});
	}

	/*
	 * Get all existing property names, paginated.
	 */
	getAllPersons(): Promise<any> {
		return new Promise((resolve, reject) => {
			this.getRequest(`persons`)
				.then(resp => resolve(resp))
				.catch(err => reject(err));
		});
	}

	/*
	 * Get a count of all persons.
	 */
	getNumberOfPersons(): Promise<number> {
		return new Promise((resolve, reject) => {
			this.getRequest(`persons/count`)
				.then(resp => resolve(resp))
				.catch(err => reject(err));
		});
	}

	/*
	 * Get all properties, paginated, for a specified person.
	 */
	getPersonsProperties(personID: number): Promise<Array<any>> {
		return new Promise((resolve, reject) => {
			this.getRequest(`persons/${personID}/properties`)
				.then(resp => resolve(resp))
				.catch(err => reject(err));
		});
	}

	/*
	 * Get a spcified property.
	 */
	getPersonProperty(personID: number, realm: string, name: string, type: string): Promise<any> {
		return new Promise((resolve, reject) => {
			const propertyStr = realm + '.' + name + '.' + type;
			this.getRequest(`persons/${personID}/properties/${propertyStr}`)
				.then(resp => resolve(resp))
				.catch(err => reject(err));
		});
	}

	/*
	 * Get a specified person.
	 */
	getPerson(personID: number): Promise<any> {
		return new Promise((resolve, reject) => {
			this.getRequest(`persons/${personID}`)
				.then(resp => resolve(resp))
				.catch(err => reject(err));
		});
	}

	/*
	 * Delete a property.
	 */
	deleteProperty(personID: number, realm: string, name: string, type: string): Promise<any> {
		return new Promise((resolve, reject) => {
			const propertyStr = realm + '.' + name + '.' + type;
			this.deleteRequest(`persons/${personID}/properties/${propertyStr}`)
				.then(resp => resolve(resp))
				.catch(err => reject(err));
		});
	}

	/*
	 * Delete a person.
	 */
	deletePerson(personID: number): Promise<any> {
		return new Promise((resolve, reject) => {
			this.deleteRequest(`persons/${personID}`)
				.then(resp => resolve(resp))
				.catch(err => reject(err));
		});
	}

	/*
	 * Edit a person.
	 */
	editPerson(personID: number, name: string, value: string): Promise<any> {
		return new Promise((resolve, reject) => {
			const data = {
				name: value
			}

			this.putRequest(`persons/${personID}`, data)
				.then(resp => resolve(resp))
				.catch(err => reject(err));
		});
	}

	/*
	 * Edit a property value.
	 */
	editProperty(personID: number, realm: string, name: string, type: string, value: any): Promise<any> {
		return new Promise((resolve, reject) => {
			const propertyStr = realm + '.' + name + '.' + type;
			const data = JSON.stringify({ 'propertyValue': value });

			this.putRequest(`persons/${personID}/properties/${propertyStr}`, data)
				.then(resp => resolve(resp))
				.catch(err => {
					if (err.status == 412)  // If property doesn't exist for person, create it
						this.createProperty(personID, realm, name, type, value);
					else
						reject(err);
				});
		});
	}

	/*
	 * Create a new person.
	 */
	createPerson(email: string, password: string, phone: string): Promise<any> {
		return new Promise((resolve, reject) => {
			const data = {
				'email': email,
				'password': password,
				'phone': phone
			}

			this.postRequest('persons/new', data)
				.then(resp => resolve(resp))
				.catch(err => reject(err));
		});
	}

	/*
	 * Create a new property value for the specified person.
	 */
	createProperty(personID: number, realm: string, name: string, type: string, value: string): Promise<any> {
		return new Promise((resolve, reject) => {
			const propertyStr = realm + '.' + name + '.' + type;
			const data = JSON.stringify({ 'propertyValue': value });

			this.postRequest(`persons/${personID}/properties/${propertyStr}`, data)
				.then(resp => resolve(resp))
				.catch(err => reject(err));
		});
	}

	/*
	 * Get a list of all selectable sports properties.
	 */
	getAllSportsProperties(): Promise<any> {
		return new Promise((resolve, reject) => {
			this.getRequest('properties')
				.then(resp => {
					if (resp) {
						let allSports: Array<SportsType> = [];
						resp.forEach(property => {
							const propertyRealm = property['name'].substr(0, property['name'].indexOf('.'));
							const propertyName = property['name'].substr(property['name'].indexOf('.') + 1,
								(property['name'].lastIndexOf('.') - property['name'].indexOf('.') - 1));
							const propertyType = property['name'].substr(property['name'].lastIndexOf('.') + 1);

							if (propertyRealm == 'person' && propertyName.includes('likes_') && propertyType == 'bool') {
								const sportsName = propertyName.substr(propertyName.indexOf('_') + 1).replace(/_/g, ' ').split(' ');
								let sportsTitle = [];
								for (let i = 0; i < sportsName.length; i++) {
									sportsTitle.push(sportsName[i].charAt(0).toUpperCase() + sportsName[i].slice(1));
								}
								allSports.push({ title: sportsTitle.join(' '), propertyName: propertyName, imgUrl: '', favorite: false });
							}
						});
						resolve(allSports);
					}
				})
				.catch(err => reject(err));
		});
	}
}
