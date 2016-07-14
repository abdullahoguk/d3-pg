"use strict";

/**
 * Node.js File System
 * @type {exports|module.exports}
 */
var fs = require( 'fs' );
var fspath = require( 'path' );

/**
 * Module File
 * Loads/Saves/Modifies/Creates JSON files
 * @constructor
 */
var File = function( async ){
    var $this = this;

    /**
     * The options used when interacting with files.
     * @type {{encoding: string, flag: string}}
     */
    this.opts = { encoding: 'utf8' };

    /**
     * The instance bootstrap command.
     * Sets the instance's "async" property.
     * @param async
     */
    this.boot = function( async ){
        $this.sync( async === false );
    };

    /**
     * Returns boolean. True if using synchronous calls, false if asynchronous.
     * @param {*} value
     * @returns {boolean}
     */
    this.sync = function( value ){
        if( value !== false && value !== true ) return ! $this.async;

        $this.async = ! value;

        return ! $this.async;
    };

    /**
     * Sets the file name. Attaches ".json" extension if not provided in filename.
     * @param file
     * @param path
     * @returns {string|*}
     */
    this.name = function( file, path ){
        if( ! file && ! path ) return $this.path;

        file = file.substr( file.length - 5 ) === ".json" ? file : file + '.json';

        $this.path = path === false ? file : [ path ? fspath.resolve( path ) : fspath.resolve( './' ), file ].join( '/' );

        return $this.path;
    };

    /**
     * Returns assertion that the provided value can be used as a JSON object property name;
     * @param key
     * @returns {boolean}
     */
    this.good = function( key ){
        if( key !== null ){
            if( typeof key === 'number' && key >= 0 ) return true;
            if( typeof key === 'string' && key !== '' ) return true;
        }

        return false;
    };

    /**
     * Returns a human-readable content-string for populating the file.
     * @param data
     */
    this.form = function( data ){
        if( typeof data !== 'object' || data === null ) return false;

        return JSON.stringify( Array.isArray( data ) ? { data: data } : data, null, 2 );
    };

    /**
     * Recursively merges properties of two objects. Values in "src_object" will
     * overwrite existing property values within "dst_object". The properties
     * in "dst_object" will only change if "src_object" has the same item.
     */
    this.mash = function( dst_object, src_object ){
        for( var prop in src_object ){
            if( src_object.hasOwnProperty( prop ) ){
                try{
                    if( src_object[ prop ].constructor === Object ){
                        dst_object[ prop ] = $this.mash( dst_object[ prop ], src_object[ prop ] );
                    } else{
                        dst_object[ prop ] = src_object[ prop ];
                    }
                } catch( e ){
                    dst_object[ prop ] = src_object[ prop ];
                }
            }
        }

        return dst_object;
    };

    /**
     * Creates a key within an object using a "dot" notation string.
     * @param seek
     * @param value
     * @param data
     * @returns {*}
     */
    this.fill = function( seek, value, data ){
        var fill = '';
        var ends = '';
        var filler;
        var property;
        if( seek.indexOf( "." ) === - 1 ) data[ seek ] = value;

        if( ! data[ seek ] ){
            var splits = seek.split( '.' );

            for( var layer in splits ){
                if( splits.hasOwnProperty( layer ) ){
                    property = '{"' + splits[ layer ] + '":';
                    fill = fill ? fill + property : property;
                    ends = ends ? ends + '}' : '}';
                    fill += parseInt( layer ) + 1 === splits.length ? '"' + value + '"' + ends : '';
                }
            }

            try{ filler = JSON.parse( fill ); } catch( e ){ filler = false; }

            if( filler ) data = $this.mash( data, filler );
        }

        return data;
    };

    /**
     * Locates a key within an object using a "dot" notation string.
     * @param seek
     * @param data
     * @returns {*}
     */
    this.seek = function( seek, data ){
        if( data[ seek ] ) return data[ seek ];
        if( seek.indexOf( "." ) === - 1 ) return null;

        var splits = seek.split( '.' );

        for( var layer in splits ){
            if( splits.hasOwnProperty( layer ) ){
                data = data[ splits[ layer ] ] || null;

                if( data === null ) return null;
            }
        }

        return data;
    };

    /**
     * Handles errors during manipulation of files.
     * @param err
     * @param callback
     */
    this.fail = function( err, callback ){
        throw new Error( err, JSON.stringify( callback ));
    };

    /**
     * Provides existence boolean in return value or callback.
     * @param callback
     */
    this.find = function( callback ){
        if( $this.sync( null )) return fs.existsSync( $this.path );

        fs.exists( $this.path, callback );
    };

    /**
     * Creates the file if it doesn't exist.
     * @param callback
     */
    this.make = function( callback ){
        if( $this.sync( null )){
            var created = false;
            try{
                fs.openSync( $this.path, 'wx' );
                fs.writeFileSync( $this.path, $this.form( {} ));
                 created = true;
            } catch( e ){}

            return created;
        } else{
            fs.open( $this.path, 'wx', function( err ){
                if( err !== null ) return callback( false );

                fs.writeFile( $this.path, $this.form( {} ), function( err ){
                    if( err !== null ) return callback( false );

                    callback( true );
                });
            });
        }
    };

    /**
     * Returns the directory path string for the current file.
     * @returns {string}
     */
    this.home = function(){
        var path_data = $this.name().split( '/' );
        path_data.splice( path_data.length - 1, 1 );

        return path_data.join( '/' ) + '/';
    };

    /**
     * Forces a command (function) to run synchronously.
     * Returns the result of the command's execution.
     * Preserves the (sync/async) execution state.
     */
    this.wait = function( command, param_one, param_two ){
        var orig_sync = ! $this.async;

        $this.sync( true );
        var result = command( param_one, param_two );
        $this.sync( orig_sync );

        return result;
    };

    /**
     * Copies the current file's contents into a new file in the same directory.
     * Will overwrite an existing file. Callback provided "successful" bool
     * as the first arg, and also "overwritten" bool, as the second arg.
     * @param copy_name
     * @param callback
     */
    this.copy = function( copy_name, callback ){
        var success = false;
        var orig_name = $this.name();
        var orig_data = $this.wait( $this.load );
        var copy_path = $this.home() + copy_name;
        $this.name( copy_path, false );
        if( $this.sync( null )){
            if( $this.path === orig_name ) return false;
            if( $this.save( orig_data ) && $this.find()) success = true;

            $this.name( orig_name, false );

            return success;
        } else{
            if( $this.path === orig_name ) return callback( false, false );
            $this.find( function( copy_existed ){
                $this.save( orig_data, function( saved ){
                    $this.find( function( copy_created ){
                        $this.name( orig_name, false );

                        callback( saved && copy_created, copy_existed );
                    });
                });
            });
        }
    };

    /**
     * Deletes a .json file from the provided path
     * @param callback
     * @returns {boolean}
     */
    this.nuke = function( callback ){
        var deleted;
        if( $this.sync( null ) ){
            if( $this.find() ){
                fs.unlinkSync( $this.path );
                deleted = ! $this.find();
            }

            return !! deleted;
        } else{
            $this.find( function( exists ){
                if( ! exists ) return callback( false );

                return fs.unlink( $this.path, function(){
                    $this.find( function( exists ){
                        callback( ! exists );
                    });
                });
            });
        }
    };

    /**
     * Reads and parses the data within a file. If the file has no contents,
     * it will then be populated with {}. If the file does not exist, it
     * will be created/populated with {}. Returns parsed file content.
     * @param callback
     * @return {{}|null}
     */
    this.read = function( callback ){
        if( $this.sync( null )){
            var data;
            try{ data = fs.readFileSync( $this.path, $this.opts ); }
            catch( e ){
                $this.make();
                data = fs.readFileSync( $this.path, $this.opts );
            }

            data = data && data !== '' ? JSON.parse( data ) : {};

            return data;
        } else{
            fs.readFile( $this.path, $this.opts, function( err, data ){
                if( err !== null ) return $this.fail( err );

                data = data && data !== '' ? JSON.parse( data ) : {};

                callback( data );
            });
        }
    };

    /**
     * Loads an object from a .json file.
     * @param callback
     * @returns {{}}
     */
    this.load = function( callback ){
        if( $this.sync( null )) return $this.read( null );

        var created = false;
        $this.find( function( exists ){
            if( exists ) return $this.read( function( data ){

                callback( data, created );
            });

            $this.make( function( created ){
                $this.read( function( data ){
                    callback( data, created );
                });
            });
        });
    };

    /**
     * Updates the contents of a file.
     */
    this.edit = function( data, callback ){
        if( $this.sync( null )){
            try{
                if( typeof fs.writeFileSync( $this.path, $this.form( data )) === 'undefined') return true;
            } catch( e ){
                $this.make();
                try{
                    if( typeof fs.writeFileSync( $this.path, $this.form( data )) === 'undefined') return true;
                } catch( e ){
                    return false;
                }
            }
        } else{
            fs.writeFile( $this.path, $this.form( data ), function( err ){
                if( err !== null ) return $this.fail( err );

                callback( true );
            });
        }
    };

    /**
     * Saves an object to a .json file.
     * @param data
     * @param callback
     * @returns {boolean}
     */
    this.save = function( data, callback ){
        if( $this.sync( null )){
            return $this.edit( data );
        } else{
            var created = false;
            $this.find( function( exists ){
                if( exists ) return $this.edit( data, function( saved ){
                    callback( saved, created );
                });

                $this.make( function( created ){
                    $this.edit( data, function( saved ){
                        callback( saved, created );
                    });
                });
            });
        }
    };

    /**
     * Extracts the value of property from the file.
     * @param key - name of the property to retrieve the value from
     * @param callback
     */
    this.pull = function( key, callback ){
        if( $this.sync( null )){
            var data = $this.load();

            return $this.seek( key, data );
        } else{
            $this.load( function( data ){
                if( ! $this.good( key )) return null;

                callback( $this.seek( key, data ));
            });
        }
    };

    /**
     * Saves a value to a specific key within a .json file.
     * @param key
     * @param value
     * @param callback
     * @returns {boolean}
     */
    this.push = function( key, value, callback ){
        if( $this.sync( null )){
            if( ! $this.find()) return false;

            return $this.save( $this.fill( key, value, $this.load()));
        } else{
            $this.find( function( exists ){
                if( ! exists ) callback( false, null );
                else $this.load( function( data ){
                    var updated_data = $this.fill( key, value, data );
                    $this.save( updated_data, function( saved ){
                        callback( saved, updated_data );
                    });
                });
            });
        }
    };

    /**
     * Execute the instance's bootstrap command.
     */
    $this.boot( async );
};

/**
 * The instance bootstrap command.
 * Sets the instance's "async" property.
 */
var bootstrap = function(){ /* STUB */ };

/**
 * Execute the module bootstrap method.
 */
bootstrap();

/**
 * Export the module constructor.
 */
module.exports = File;

