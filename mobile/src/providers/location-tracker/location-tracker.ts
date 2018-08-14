import { Injectable } from '@angular/core';

@Injectable()
export class LocationTracker {
    private bgGeo: any;

    // To be defined elsewhere
    private gymLocations = [{
        identifier: 'Home',
        radius: 200,
        latitude: 38.00285200,
        longitude: -87.52081800,
        notifyOnEntry: true,
        notifyOnExit: true
    }, {
        identifier: 'Work',
        radius: 200,
        latitude: 37.983197,
        longitude: -87.460946,
        notifyOnEntry: true,
        notifyOnExit: true
    }];

    constructor() {
    }

    initialize() {
        this.bgGeo = (<any>window).BackgroundGeolocation;

        if (!this.bgGeo) return;

        // Watch for geofence events
        this.bgGeo.on('geofence', ((geofence) => {
            console.log(`LocationTracker: Geofence Triggered - ${geofence.identifier} ${geofence.action}`);
        }));

        // Background geolocation configuration
        this.bgGeo.configure({
            // Application config
            geofenceInitialTriggerEntry: true,
            stopOnTerminate: false,
            startOnBoot: true,
            locationAuthorizationAlert: {
                titleWhenNotEnabled: 'Location Services are not Enabled',
                titleWhenOff: 'Location Services Are Off',
                instructions: 'Please enable "Always" in Location Services',
                cancelButton: 'Cancel',
                settingsButton: 'Settings'
            },
            debug: true  // <-- Debug sounds & notifications.
        }, ((state) => {
            console.log(`LocationTracker Enabled`);

            if (!state.enabled) {   // Not already running in background
                this.bgGeo.startGeofences(() => {
                    console.log(`LocationTracker: Geofence Monitoring Started...`);

                    // Add coordinates for gym(s)
                    console.log(`LocationTracker: Adding Geofence(s)...`);
                    this.bgGeo.addGeofences(this.gymLocations);
                });
            } else {    // Already running in background
                console.log(`LocationTracker: Geofence Monitoring Ongoing...`);

                // Check that defined geofences are already added and, if not, add them
                this.bgGeo.getGeofences((geofences) => {
                    console.log(`LocationTracker: Checking Geofence(s)...`);
                    this.gymLocations.forEach((gymLocation) => {
                        if (!geofences.includes(gymLocation)) {
                            this.bgGeo.addGeofence(gymLocation);
                        }
                    });
                }); // Geofences check
            }   // bgGeo state enabled
        }));    // bgGeo state
    }

    dumpLog() {
        this.bgGeo.getLog((log) => {
            console.log(log);
        });
    }
}
