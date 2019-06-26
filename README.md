# Grafana Dashboard - Migrator

A tool to export and import dashboards from Grafana (for AWS Lambda/API Gateway).

*This tool is far from perfect and hacked together! - use at your own risk (but it appears to work well)*

*Also it lacks tests - sorry!*

## Grafana - Naming Conventions

This converter currently only works with AWS Lambda and API Gateway data sources.

It's expected that your ```stage``` (aka ```environment```) is of the naming convention:

| type | convention |
|----|----|
|lambda| ```<system id>-<stage/env>-<name>``` |
|API Gateway| ```<stage/env>-<system id>```|

Examples being:

**Lambda**
```
pay-sys-dev-submit
pay-sys-dev-display
```
**API**

```
dev-pay-sys
int-pay-sys
```

Keeping to a naming convention will make the conversion easier.


## Grafana Dashboards

You are free to name the dashboard as you like. 

You only need to create one version of your dashboard to be exported.  In general using the 'dev' naming convention for environment is
recommended but you are free to use anything.

## Usage

### Exporting

#### Configuration file

Example:

```json
{
  "type": "export",
  "host": "https://my-grafana-test.example.com",
  "findString": "dev-",
  "dashboards": [
    {
      "id": "0ed18-20a1-4684-aa3f-d52a034edb40",
      "template": "template/lambda-template.json"
    },
    {
      "id": "DEVn9ojK69iz",
      "template": "template/gateway-template.json"
    }
  ]
}

```
|variable|Description|
|---|----|
|type| The type of configuration file - either import or export|
|host|The hostname of the grafana instance|
|findString|This is the string to replace when creating new dashboard - normally an environment identifier|
|dashboards/id| The ID of the dashboard to export - must be exact match!|
|dashboards/template| The template file to generate|

### Importing

#### Configuration

```json
{
  "type": "import",
  "host": "https://my-grafana-prod.example.com",
  "environment": "prod",
  "dashboards": [
    {
      "id": "PROD0ed18-20a1-4684-aa3f-d52a034edb40",
      "name": "My Service - Lambda [Prod]",
      "template": "template/lambda-template.json"
    },
    {
      "id": "PRODn9ojK69iz",
      "name": "My Service - API Gateway [Prod]",
      "template": "template/gateway-template.json"
    }
  ]
}
```

|variable|Description|
|---|----|
|type| The type of configuration file - either import or export|
|host|The hostname of the grafana instance|
|environment| The new environment name|
|dashboards/id| The UUID of the dashboard to create - this can be anything and should be different to the export if the same instance of grafana.|
|dashboards/name| The name of the dashboard to create|
|dashboards/template| The template file to use|


## Grafana Version

This code was tested against ```Version: 5.4.2```

## Building the executable

Install  [nexe](https://github.com/nexe/nexe)

```npm install -g nexe```

Build executable

```nexe index.js -o dist/grafanaDashboard -t 8.10.0```


## Usage

Using the binary from the dist folder.

```
grafanaDashboard -c <config file>
```
