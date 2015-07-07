'use strict';

var async = require('async');
var _ = require('lodash');

module.exports = function(grunt) {

	grunt.registerTask('raygun-changelog', 'Gather information about the git repository.', function(version) {

		var done = this.async();
		var pkg = grunt.file.readJSON('package.json');
		var release = {
			version: version
		};
		var options = this.options({});

		var commands = {
			notes: ['log', '--tags', pkg.version + '..HEAD', '--no-merges', '--format="' + options.format || '%s' + '"'],
			ownerName: ['config', '--global', 'user.name'],
			emailAddress: ['config', '--global', 'user.email']
		};

		var apply = function(key, next) {
			var args = commands[key];

			grunt.util.spawn({
					cmd: 'git',
					args: args
				},
				function(err, result, code) {
					if (err || code > 0) {
						grunt.fatal('Couldn\'t set key: ' + key);
					} else {

						release[key] = result.stdout;

						grunt.log.writeln(key, '=', result.stdout);

					}
					next();
				}
			);
		};

		var end = function() {
			var merged = _.merge(grunt.config.get('raygun_deployment'), {
				options: {
					release: release
				}
			});

			grunt.config.set('raygun_deployment', merged);
			done();
		};

		async.each(Object.keys(commands), apply, end);

	});
};
