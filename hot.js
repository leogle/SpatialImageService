/**
 * Created by lrh on 2017-12-01.
 */
var supervisor = require('supervisor');
/**
 * Supervisor Run www
 */

var args = new Array()
args[0] = 'bin/www';

supervisor.run(args);