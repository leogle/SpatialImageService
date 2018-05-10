/**
 * Created by lrh on 2017-12-01.
 */
const supervisor = require('supervisor');
/**
 * Supervisor Run www
 */

var args = [];
args[0] = 'bin/www';

supervisor.run(args);