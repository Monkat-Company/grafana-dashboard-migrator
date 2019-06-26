const fs = require('fs-extra');
const rp = require('request-promise');
const options = {};

let deleteDashboard = () => {

    return new Promise((resolve, reject) => {

        let deleteOptions = {
            headers: {
                'Authorization': 'Bearer ' + process.env.GRAFANA_API_KEY
            },
            uri: options.host + '/api/dashboards/uid/' + options.dashboard,
            method: 'DELETE'
        };

        rp(deleteOptions)
            .then(() => {
                console.log('Previous dashboard removed: ', options.dashboard);
                resolve();

            }).catch((err) => {
            if (err.statusCode === 404) {
                console.log('No previous dashboard found.');
                resolve();
            } else {
                console.error('Unexpected response code : %d Response : %s', err.statusCode, err);
                reject("Unexpected response code");
            }
        });
    });

};

let updateTemplate = () => {
    return new Promise((resolve, reject) => {

        fs.readFile(options.filename, function (err, data) {

            if (err) {
                console.log("Cannot load file: ", err);
                reject(err);
            }

            //Replace vars in template if any.
            let newData = data.toString().replace(/SETME/g, options.environment);
            let templateData = JSON.parse(newData);
            templateData['dashboard']['title'] = options.title;
            templateData['dashboard']['uid'] = options.dashboard;
            return resolve(templateData);
        });

    });
};

function createDashboard(templateData) {

    console.log('Creating dashboard: ' + options.dashboard);

    let postOptions = {
        headers: {
            'Authorization': 'Bearer ' + process.env.GRAFANA_API_KEY,
            'Content-Type': 'application/json'
        },
        uri: options.host + '/api/dashboards/db',
        body: JSON.stringify(templateData),
        method: 'POST'
    };

    return rp(postOptions);

}

async function runIt(host, id, name, environment, template) {

    options.dashboard = id;
    options.filename = template;
    options.environment = environment;
    options.title = name;
    options.host = host;
    return await deleteDashboard()
        .then(updateTemplate)
        .then(createDashboard);

}

module.exports.runIt = runIt;

