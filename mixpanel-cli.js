'use strict';
const Mixpanel = require('mixpanel');
const _ =require('lodash/fp');
const API_KEY = process.env.MIXPANEL_API_KEY;

if(!API_KEY){
  console.error('Environment variable "MIXPANEL_API_KEY" must be defined');
  process.exit(1);
}

const mixpanel = Mixpanel.init(API_KEY, {protocol: 'https'});

mixpanel.config.debug = true;
const log = console.log.bind(console);
console.log = function(data){ // sigh...

  if(_.isPlainObject(data)){
    const printedData = _.cloneDeep(data);
    printedData.$token = '** MASKED BY MIXPANEL-CLI 👻 **';
    log(printedData);
  }
};

const protocol = require('./protocol.json') // Oh yeah :)
.filter(command => (command.method.name.includes('mixpanel.track') || command.method.name.includes('mixpanel.people')) && !command.method.name.includes('mixpanel.track_links') && !command.method.name.includes('mixpanel.track_forms')) // could be expanded in the futur
.map(command => {
  // add unique_id to every methods
  command.method.arguments.unshift({
    "name": "distinct_id",
    "type": "String",
    "requireIdentify": true,
    "isRequired": true,
    "description": "Identify a user with a unique ID"
  });

  // remove mixpanel.
  command.method.name = command.method.name.replace('mixpanel.', '');

  // map object values to key value pairs

  function noCallback(arg){
    return arg.name !== 'callback';
  }

  command.method.arguments = command.method.arguments
  .filter(noCallback)
  .map(arg => {
    if(arg.type === 'Object'){
      arg.mixpanelType = 'array';
    } else if(arg.type === 'Number'){
      arg.mixpanelType = 'number';
    } else if(arg.type === 'String' || arg.type === '*' || arg.type === 'Object or String'){
      arg.mixpanelType = 'string';
    } else {
      throw new Error(`Unsupported method argument type ${arg.type} for "${command.method.name}" : ${JSON.stringify(arg, null, 2)}`);
    }

    return arg;
  });

  return command;
});


const argv = require('yargs')
.wrap(null) //  specify no column limit (no right-align)
.count('Usage:  $0 <command> [options]');

protocol.forEach(({method: {name, arguments:args}, description}) => {
  argv.command(
    name,
    description.split('.')[0],
    yargs => args.reduce(argToYargOption, yargs),
    runCommand
  );
});

const args = argv.help()
  .alias('h', 'help')
  .epilog('@FGRibreau - https://twitter.com/FGRibreau')
  .alias('v', 'verbose')
  .argv;

if(args._.length === 0){
  return argv.showHelp();
}

function argToYargOption(yargs, arg){
  return yargs.options(arg.name, {
    demand: arg.isRequired,
    describe: arg.description,
    type: arg.mixpanelType
  })
}


function runCommand(argv){
  const commandName = _.first(argv._);

  const method = _.find(api => api.method.name === commandName, protocol).method;

  // if the commands does not have any args, first parameter is distinct_id
  const args = method.arguments.filter(a => a.name !== 'distinct_id');

  const mpCallCtx = _.get(_.initial(method.name.split('.')), mixpanel);
  const mpCall = _.get(method.name, mixpanel).bind(mpCallCtx);
  const mpCallback = (err) => {
    if(err){
      console.error(err);
      throw err;
    }
    console.log('done');
  };

  if(args.length === 0){
    return mpCall(argv.distinct_id, mpCallback);
  }

  if(method.name.includes('people')){
    const peopleArgs = [argv.distinct_id].concat(args.map(arg => {
      return argv[arg.name];
    })).concat(mpCallback);
    return mpCall.apply(null, peopleArgs);
  }

  const defaultArgs = _.initial(args).map(arg => {
    return argv[arg.name];
  })
  .concat(_.flow(_.chunk(2), _.fromPairs, _.tap(properties => properties.distinct_id = argv.distinct_id))(argv.properties || []))
  .concat(mpCallback);

  return mpCall.apply(null, defaultArgs);
}
