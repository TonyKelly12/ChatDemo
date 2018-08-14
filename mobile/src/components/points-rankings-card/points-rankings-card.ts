import { Component } from '@angular/core';

export interface StoredPointData {
	alias: string,
	value: number,
	rank: number
}

/**
 * Generated class for the PointsRankingsCardComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
	selector: 'points-rankings-card',
	templateUrl: 'points-rankings-card.html'
})
export class PointsRankingsCardComponent {

	text: string;

	constructor() {
		console.log('Hello PointsRankingsCardComponent Component');
		this.text = 'Hello World';
	}

	public queryAdjoiningRankingsForMonth(): StoredPointData[] {
		return [];
	}
}
