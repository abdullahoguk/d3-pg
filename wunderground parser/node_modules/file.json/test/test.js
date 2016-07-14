var should = require( "should" );
var File = require( '../index' );

/**
 * The file.json module instance
 */
var file;

describe( 'File', function(){
    describe( 'Bootstrap', function(){
        it( 'instantiates an asynchronous instance when any/no parameters except boolean "false" are passed on creation', function(){
            new File().sync().should.equal( false );
            new File( 'Ham sandwiches and chips.' ).sync().should.equal( false );
            new File( 0 ).sync().should.equal( false );
            new File( NaN ).sync().should.equal( false );
            new File( undefined ).sync().should.equal( false );
            new File( false ).sync().should.equal( true );
        });
    });

    describe( 'Configuration and Construction', function(){
        before( function(){ file = new File(); } );



        describe( "#sync()", function(){
            it( 'sets the instance\'s "async" value, to the opposite of the value provided, when calling "sync()" with a boolean parameter', function(){
                file.sync( true );//For Syncronous Operation
                file.sync().should.equal( true );
                file.async.should.equal( false );

                file.sync( false );//For Asyncronous Operation
                file.sync().should.equal( false );
                file.async.should.equal( true );
            } );
        } );

        describe( '#name()', function(){
            it( 'attaches json extension if not provided', function(){
                file.name( 'lazy' ).indexOf( 'lazy.json' ).should.not.equal( - 1 );
            } );

            it( 'does not attach json extension if included', function(){
                file.name( 'lazy.json' ).indexOf( 'lazy.json.json' ).should.equal( - 1 );
            } );

            it( 'resolves full path to process cwd if no path is provided', function(){
                var expected_path = '/full.json';
                var returned_path = file.name( 'full' );
                returned_path.indexOf( expected_path ).should.not.equal( - 1 );
                returned_path.substr( returned_path.indexOf( expected_path ), expected_path.length ).should.equal( expected_path );
            } );

            it( 'resolves full path to specific directory if __dirname is provided when called', function(){
                var returned_path = file.name( 'dirname', __dirname );
                var expected_path = '/test/dirname.json';
                returned_path.indexOf( expected_path ).should.not.equal( - 1 );
                returned_path.substr( returned_path.indexOf( expected_path ), expected_path.length ).should.equal( expected_path );
            } );

            it( 'resolves full path as provided if a full path is provided WITH false as the second parameter', function(){
                var returned_path = file.name( '/Users/josh/code/node_modules/file.json/test/fixtures/full_WITH_false_path', false );

                returned_path.should.equal( '/Users/josh/code/node_modules/file.json/test/fixtures/full_WITH_false_path.json' );
            });
        } );

        describe( '#good()', function(){
            it( 'returns boolean true if passed a valid object property name', function(){
                should( file.good( 0 )).equal( true );
                should( file.good( 123456 ) ).equal( true );
                should( file.good( 'string' ) ).equal( true );
            } );

            it( 'returns boolean false if passed a value that is invalid as an object property name', function(){
                should( file.good() ).equal( false );
                should( file.good( - 1 ) ).equal( false );
                should( file.good( {} ) ).equal( false );
                should( file.good( [] ) ).equal( false );
                should( file.good( '' ) ).equal( false );
                should( file.good( NaN ) ).equal( false );
                should( file.good( null ) ).equal( false );
                should( file.good( false ) ).equal( false );
                should( file.good( undefined ) ).equal( false );
                should( file.good( { 'js': 'obj' } ) ).equal( false );
                should( file.good( [ 'js', 'arr' ] ) ).equal( false );
            } );
        } );

        describe( '#form()', function(){
            it( 'returns boolean false if passed any value that is not an object or array', function(){
                should( file.form() ).equal( false );
                should( file.form( 0 ) ).equal( false );
                should( file.form( '' ) ).equal( false );
                should( file.form( NaN ) ).equal( false );
                should( file.form( null ) ).equal( false );
                should( file.form( false ) ).equal( false );
                should( file.form( 123456 ) ).equal( false );
                should( file.form( 'string' ) ).equal( false );
                should( file.form( undefined ) ).equal( false );
            } );

            it( 'returns a formatted JSON file-content string if passed a valid array or object.', function(){
                file.form( { valid: "object" } ).should.equal( "{\n  \"valid\": \"object\"\n}" );
                file.form( [ 'valid', 'array' ] ).should.equal( "{\n  \"data\": [\n    \"valid\",\n    \"array\"\n  ]\n}" );
            } );
        } );

        describe( '#mash()', function(){
            it( 'merges the properties of two objects and returns the product', function(){
                var object_one = { first: "FIRST" };
                var object_two = { second: "SECOND" };

                file.mash( object_one, object_two ).should.deepEqual( { first: "FIRST", second: "SECOND" } );
            } );

            it( 'overwrites the values of the first object with matching properties from the second', function(){
                var object_one = { test: { key: { original: "ORIGINAL" } } };
                var object_two = { test: { key: { original: "CHANGED" } } };

                file.mash( object_one, object_two ).should.deepEqual( object_two );
            } );

            it( 'maintains all properties from both objects, and preserves object structure', function(){
                var object_one = { deep: { key: { structure: "PRESERVED" } } };
                var object_two = { deep: { properties: "INTACT" } };

                file.mash( object_one, object_two ).should.deepEqual( { deep: { key: { structure: "PRESERVED" }, properties: "INTACT" } } );
            } );
        } );

        describe( '#fill()', function(){
            it( 'creates a deep key within an object using a "dot" notation string', function(){
                var deep_key_value = "CREATED";
                var deep_key_string = 'deep.key.created';

                var deep_key_object = file.fill( deep_key_string, deep_key_value, {} );

                deep_key_object.should.deepEqual( { deep: { key: { created: "CREATED" } } } );
            } );

            it( 'doesnt damage existing data, within the layers touched by a deep key insert.', function(){
                var deep_key_value = "CREATED";
                var deep_key_string = 'deep.key.created';
                var existing = { deep: { "exists": true, "key": { "exists": true, "created": "NOT CREATED" } } };

                var deep_key_object = file.fill( deep_key_string, deep_key_value, existing );
                deep_key_object.should.have.property( 'deep' );
                deep_key_object.deep.should.have.property( 'exists' );
                deep_key_object.deep.key.should.have.property( 'exists' );
                deep_key_object.deep.key.created.should.equal( "CREATED" );
            } );
        } );

        describe( '#seek()', function(){
            it( 'locates a deep key within an object using a "dot" notation string', function(){
                var deep_key_object = { very: { deep: { key: "FOUND" } } };
                var deep_key_seeker = 'very.deep.key';

                file.seek( deep_key_seeker, deep_key_object ).should.equal( "FOUND" );
            } );
        } );
    } );

    describe( 'Asyncronous Instance Operation', function(){
        beforeEach( function(){ file = new File(); });

        describe( '#wait()', function(){
            it( 'forces the "command" parameter (function) to be called synchronously', function(){
                file.sync( false ).should.equal( false );
                file.sync( null ).should.equal( false );
                file.wait( file.sync ).should.equal( true );
            });

            it( 'accepts additional parameters( 2 ) and passes them to the command as arguments', function(){
                file.name( 'fixtures/make_fixture', __dirname );
                file.wait( file.make ).should.equal( true );
                file.wait( file.find ).should.equal( true );
                file.wait( file.save, {} ).should.equal( true );
                file.wait( file.push, 'pushed', 'synchronously' ).should.equal( true );
                file.wait( file.load ).should.deepEqual({ pushed: 'synchronously' });
                file.wait( file.nuke ).should.equal( true );
            });

            it( 'preserves the previous execution state of the instance', function(){
                //set to false
                file.sync( false );
                file.wait( file.sync ).should.equal( true );
                file.sync( null ).should.equal( false );

                //set to true
                file.sync( true );
                file.wait( file.sync ).should.equal( true );
                file.wait( file.sync, false ).should.equal( false );
                file.wait( file.sync ).should.equal( true );
                file.sync( null ).should.equal( true );
            });
        });

        describe( '#find()', function(){
            beforeEach( function( done ){
                file.name( 'fixtures/find_existing', __dirname );
                file.find( function( exists ){
                    if( ! exists ) file.wait( file.make );
                    file.find( function( exists ){
                        if( ! exists ) throw new Error( 'Unable to create file before find' );

                        done();
                    });
                })
            });

            afterEach( function( done ){
               file.nuke( function(){
                   file.find( function( exists ){
                       if( exists ) throw new Error( 'Unable to destroy after find' );

                       done();
                   });
               })
            });

            after( function( done ){
                file.name( 'fixtures/find_existing', __dirname );
                file.nuke( function(){
                    file.find( function( exists ){
                        if( exists ) throw new Error( 'Unable to destroy after all find' );

                        done();
                    });
                });
            });

            it( 'sends the callback a boolean true if the file exists', function( done ){
                file.find( function( exists ){
                    exists.should.equal( true );
                    done();
                } );
            } );

            it( 'sends the callback a boolean false if the file does not exist', function( done ){
                file.name( 'fixtures/find_missing', __dirname );
                file.find( function( exists ){
                    exists.should.equal( false );
                    done();
                } );
            } );
        });

        describe( '#make()', function(){
            beforeEach( function( done ){
                file.name( 'fixtures/make_existing', __dirname );
                file.make( function(){
                    file.find( function( exists ){
                        if( ! exists )  throw new Error( 'Unable to create file before make' );

                        done();
                    });
                });
            });

            afterEach( function( done ){
                file.nuke( function(){
                    file.find( function( exists ){
                        if( exists ) throw new Error( 'Unable to destroy after make' );

                        done();
                    });
                })
            });

            after( function( done ){
                file.name( 'fixtures/make_existing', __dirname );
                file.nuke( function(){
                    file.find( function( exists ){
                        if( exists ) throw new Error( 'Unable to destroy after all make' );

                        done();
                    });
                });
            });

            describe( '@callback', function(){
                it( 'receives a boolean true if the file was created', function( done ){
                    file.name( 'fixtures/make_missing', __dirname );
                    file.make( function( created ){
                        created.should.equal( true );
                        done();
                    } );
                } );

                it( 'receives a boolean false if the file was not created', function( done ){
                    file.name( 'fixtures/make_existing', __dirname );
                    file.make( function( created ){
                        created.should.equal( false );
                        done();
                    } );
                } );
            } );

            describe( '@behavior', function(){
                it( 'creates a file if it doesn\'t exist', function( done ){
                    file.name( 'fixtures/make_missing', __dirname );
                    file.find( function( exists ){
                        exists.should.equal( false );
                        file.make( function( created ){
                            created.should.equal( true );
                            file.find( function( exists ){
                                exists.should.equal( true );
                                done();
                            });
                        });
                    });
                });

                it( 'doesn\'t affect existing files', function( done ){
                    file.name( 'fixtures/make_existing', __dirname );
                    file.find( function( exists ){
                        exists.should.equal( true );
                        file.make( function( created ){
                            created.should.equal( false );
                            file.find( function( exists ){
                                exists.should.equal( true );
                                done();
                            });
                        });
                    });
                });
            });
        });

        describe( '#copy()', function(){
            beforeEach( function( done ){
                file.name( 'fixtures/copy_existing', __dirname );
                file.make( function(){
                    file.find( function( exists ){
                        if( ! exists )  throw new Error( 'Unable to create file before copy' );

                        done();
                    });
                });
            });

            afterEach( function( done ){
                file.nuke( function(){
                    file.find( function( exists ){
                        if( exists ) throw new Error( 'Unable to destroy after copy' );

                        done();
                    });
                })
            });

            after( function( done ){
                file.name( 'fixtures/copy_existing', __dirname );
                file.nuke( function(){
                    file.find( function( exists ){
                        if( exists ) throw new Error( 'Unable to destroy after all copy' );

                        done();
                    });
                });
            });

            describe( '@callback', function(){
                it( 'receives a boolean true if the copy was successful, as the first argument', function( done ){
                    file.copy( 'copy_created', function( success, overwritten ){
                        success.should.equal( true );
                        file.name( 'fixtures/copy_created', __dirname );
                        file.find( function( exists ){
                            console.log( 'exists' );
                            exists.should.equal( true );

                            done();
                        });
                    });
                });

                it( 'receives a boolean false if the copy was unsuccessful, as the first argument', function( done ){
                    file.copy( 'copy_existing', function( success, overwritten ){
                        success.should.equal( false );
                        overwritten.should.equal( false );
                        done();
                    });
                });

                it( 'receives a boolean false if a file was created at the copy path, as the second argument ( not overwitten )', function( done ){
                    file.copy( 'copy_created', function( success, overwritten ){
                        success.should.equal( true );
                        overwritten.should.equal( false );
                        file.name( 'fixtures/copy_created', __dirname );
                        file.find( function( exists ){
                            exists.should.equal( true );

                            done();
                        });
                    });
                });

                it( 'receives a boolean true if a file existed at the copy path, as the second argument ( overwitten )', function( done ){
                    file.name( 'fixtures/copy_created', __dirname );
                    file.make( function( created ){
                        created.should.equal( true );
                        file.name( 'fixtures/copy_existing', __dirname );
                        file.copy( 'copy_created', function( success, overwritten ){
                            success.should.equal( true );
                            overwritten.should.equal( true );
                            file.name( 'fixtures/copy_created', __dirname );
                            file.find( function( exists ){
                                exists.should.equal( true );

                                done();
                            });
                        });
                    });
                });
            });

            describe( '@behavior', function(){
                it( 'creates a copy of the current file within the current file\'s directory', function( done ){
                    file.copy( 'copy_created', function( success, overwritten ){
                        success.should.equal( true );
                        file.name( 'fixtures/copy_created', __dirname );
                        file.find( function( exists ){
                            exists.should.equal( true );

                            done();
                        });
                    });
                });

                it( 'overwrites existing files', function( done ){
                    file.name( 'fixtures/copy_created', __dirname );
                    file.make( function( created ){
                        created.should.equal( true );
                        file.name( 'fixtures/copy_existing', __dirname );
                        file.copy( 'copy_created', function( success, overwritten ){
                            success.should.equal( true );
                            overwritten.should.equal( true );
                            file.name( 'fixtures/copy_created', __dirname );
                            file.find( function( exists ){
                                exists.should.equal( true );

                                done();
                            });
                        });
                    });
                });

                it( 'creates a copy, the contents of which, exactly match the original ( test on overwrite )', function( done ){
                    file.save({ match: "contents" }, function( saved ){
                        saved.should.equal( true );
                        file.copy( 'copy_created', function( success, overwritten ){
                            success.should.equal( true );
                            file.name( 'fixtures/copy_created', __dirname );
                             file.load( function( loaded ){
                             loaded.should.deepEqual({ match: "contents" });

                             done();
                             });
                        });
                    });

                });

                it( 'does not change the current file path while executing', function( done ){
                    var current_path = file.path;
                    file.copy( 'copy_created', function(){
                        file.path.should.equal( current_path );
                        file.name( 'fixtures/copy_created', __dirname );

                        done();
                    });
                });
            });
        });

        describe( '#nuke()', function(){
            beforeEach( function( done ){
                file.name( 'fixtures/nuke_existing', __dirname );
                file.make( function(){
                    file.find( function( exists ){
                        if( ! exists )  throw new Error( 'Unable to create file before nuke' );

                        done();
                    });
                });
            });

            afterEach( function( done ){
                file.nuke( function(){
                    file.find( function( exists ){
                        if( exists ) throw new Error( 'Unable to destroy after nuke' );

                        done();
                    });
                })
            });

            after( function( done ){
                file.name( 'fixtures/nuke_existing', __dirname );
                file.nuke( function(){
                    file.find( function( exists ){
                        if( exists ) throw new Error( 'Unable to destroy after all nuke' );

                        done();
                    });
                });
            });

            it( 'sends the callback a boolean true if the file existed and was deleted', function( done ){
                file.nuke( function( destroyed ){
                    destroyed.should.equal( true );
                    done();
                });
            } );

            it( 'sends the callback a boolean false if the file did not exist', function( done ){
                file.name( 'fixtures/nuke_missing', __dirname );
                file.nuke( function( destroyed ){
                    destroyed.should.equal( false );
                    done();
                });
            });
        });

        describe( '#load()', function(){
            beforeEach( function( done ){
                file.name( 'fixtures/load_existing', __dirname );
                file.make( function(){
                    file.find( function( exists ){
                        if( ! exists ) throw new Error( 'Unable to create file before load' );

                        file.save({ key: 'value' }, function( saved ){
                            if( ! saved ) throw new Error( 'Unable to save file before load' );

                            done();
                        })
                    });
                });
            });

            afterEach( function( done ){
                file.nuke( function(){
                    file.find( function( exists ){
                        if( exists ) throw new Error( 'Unable to destroy after find' );

                        done();
                    });
                })
            });

            after( function( done ){
                file.name( 'fixtures/load_existing', __dirname );
                file.nuke( function(){
                    file.find( function( exists ){
                        if( exists ) throw new Error( 'Unable to destroy after all nuke' );

                        done();
                    });
                });
            });

            describe( '@callback', function(){
                it( 'receives the parsed contents of the file, as the first argument ( file existed )', function( done ){
                    file.load( function( loaded ){
                        loaded.should.be.an.object;
                        loaded.should.deepEqual({ key: 'value' });
                        done();
                    });
                } );

                it( 'receives an empty object, as the first argument ( file was created )', function( done ){
                    file.name( 'fixtures/load_missing', __dirname );
                    file.load( function( loaded ){
                        loaded.should.be.an.object;
                        loaded.should.not.have.any.properties;
                        file.nuke( function(){ done(); });
                    } );
                } );

                it( 'receives a boolean false if the file existed, as the second argument', function( done ){
                    file.load( function( loaded, created ){
                        created.should.equal( false );
                        done();
                    } );
                } );

                it( 'receives a boolean true if the file was created, as the second argument', function( done ){
                    file.name( 'fixtures/load_missing', __dirname );
                    file.load( function( loaded, created ){
                        created.should.equal( true );
                        file.nuke( function(){ done(); } );
                    } );
                });
            } );

            describe( '@behavior', function(){
                it( 'loads the contents of a file that exists', function( done ){
                    file.load( function( loaded ){
                        loaded.should.be.an.object;
                        loaded.should.deepEqual({ key: 'value' });
                        done();
                    } );
                } );

                it( 'forces creation of a file that does not exist', function( done ){
                    file.name( 'fixtures/load_missing', __dirname );
                    file.find( function( exists ){
                        exists.should.equal( false );
                        file.load( function( loaded, created ){
                            created.should.equal( true );
                            file.find( function( exists ){
                                exists.should.equal( true );
                                file.nuke( function( destroyed ){
                                    if( destroyed ) return done();

                                    throw new Error( 'Failed to destroy ' + file.path );
                                });
                            });
                        });
                    });
                });
            });
        });

        describe( '#save()', function(){
            beforeEach( function( done ){
                file.name( 'fixtures/save_existing', __dirname );
                file.make( function(){
                    file.find( function( exists ){
                        if( ! exists )  throw new Error( 'Unable to create file before save' );

                        done();
                    });
                });
            });

            afterEach( function( done ){
                file.nuke( function(){
                    file.find( function( exists ){
                        if( exists ) throw new Error( 'Unable to destroy after save' );

                        done();
                    });
                })
            });

            after( function( done ){
                file.name( 'fixtures/save_existing', __dirname );
                file.nuke( function(){
                    file.find( function( exists ){
                        if( exists ) throw new Error( 'Unable to destroy after all save' );

                        done();
                    });
                });
            });

            describe( '@callback', function(){
                it( 'recieves a boolean true, as the first argument, if the data was saved into the file', function( done ){
                    file.save({ key: "value" }, function( saved ){
                        saved.should.equal( true );
                        file.load( function( data ){
                            data.should.deepEqual({ key: "value" });
                            done();
                        });
                    });
                });

                it( 'receives a boolean true, as the second argument, if the file was created', function( done ){
                    file.name( 'fixtures/save_missing', __dirname );
                    file.find( function( exists ){
                        exists.should.equal( false );
                        file.save({ key: "value" }, function( saved, created ){
                            created.should.equal( true );
                            saved.should.equal( true );
                            file.find( function( exists ){
                                exists.should.equal( true );
                                done();
                            });
                        });
                    });
                });

                it( 'receives a boolean false, as the second argument, if the file existed', function( done ){
                    file.save({ key: "values" }, function( saved, created ){
                        saved.should.equal( true );
                        created.should.equal( false );
                        file.find( function( exists ){
                            exists.should.equal( true );
                            file.load( function( data ){
                                data.should.deepEqual({ key: 'values' });
                                done();
                            });
                        });
                    });
                });
            });

            describe( '@behavior', function( done ){
                it( 'saves data into the file', function(){
                    file.make( function( created ){
                        created.should.equal( true );
                        file.save({ key: "value" }, function( saved ){
                            saved.should.equal( true );
                            file.load( function( data ){
                                data.should.deepEqual({ key: 'value' });
                                done();
                            });
                        });
                    });
                });

                it( 'forces creation of a file that does not exist', function( done ){
                    file.name( 'fixtures/save_missing', __dirname );
                    file.find( function( exists ){
                        exists.should.equal( false );
                        file.save({ key: "value" }, function( saved, created ){
                            saved.should.equal( true );
                            created.should.equal( true );
                            file.find( function( exists ){
                                exists.should.equal( true );
                                done();
                            });
                        });
                    });
                });
            });
        });

        describe( '#pull()', function(){
            beforeEach( function( done ){
                file.name( 'fixtures/pull_existing', __dirname );
                file.make( function(){
                    file.find( function( exists ){
                        if( ! exists )  throw new Error( 'Unable to create file before pull' );

                        var fixture = { key: 'value', deeply: { buried: { key: { value: 'DEEP_VALUE' }}}};
                        file.save( fixture, function( saved ){
                            if( ! saved ) throw new Error( 'Unable to save file before pull' );

                            done();
                        });
                    });
                });
            });

            afterEach( function( done ){
                file.nuke( function(){
                    file.find( function( exists ){
                        if( exists ) throw new Error( 'Unable to destroy after pull' );

                        done();
                    });
                })
            });

            after( function( done ){
                file.name( 'fixtures/pull_existing', __dirname );
                file.nuke( function(){
                    file.find( function( exists ){
                        if( exists ) throw new Error( 'Unable to destroy after all pull' );

                        done();
                    });
                });
            });

            describe( '@callback', function(){
                it( 'receives the value assigned to the key provided in the file, as the first argument ( if file & key exist )', function( done ){
                    file.pull( 'key', function( value ){
                        value.should.equal( 'value' );
                        done();
                    });
                });

                it( 'receives null, as the first argument ( if file/key does not exist )', function( done ){
                    file.pull( 'no_such_key', function( value ){
                        should( value ).equal( null );

                        done();
                    });
                });
            });

            describe( '@behavior', function(){
                it( 'loads a key\'s value from the file', function( done ){
                    file.pull( 'key', function( value ){
                        value.should.equal( 'value' );
                        done();
                    });
                });

                it( 'locates deep keys when provided a "dot" notation string', function( done ){
                    file.pull( 'deeply.buried.key.value', function( value ){
                        value.should.equal( 'DEEP_VALUE' );
                        done();
                    });
                });
            });
        });

        describe( '#push()', function(){

            beforeEach( function( done ){
                file.name( 'fixtures/push_existing', __dirname );
                file.make( function(){
                    file.find( function( exists ){
                        if( ! exists )  throw new Error( 'Unable to create file before push' );

                        var fixture = { key: 'value', deeply: { buried: { key: { value: 'DEEP_VALUE' }}}};
                        file.save( fixture, function( saved ){
                            if( ! saved ) throw new Error( 'Unable to save file before push' );

                            done();
                        });
                    });
                });
            });

            afterEach( function( done ){
                file.nuke( function(){
                    file.find( function( exists ){
                        if( exists ) throw new Error( 'Unable to destroy after push' );

                        done();
                    });
                })
            });

            after( function( done ){
                file.name( 'fixtures/push_existing', __dirname );
                file.nuke( function(){
                    file.find( function( exists ){
                        if( exists ) throw new Error( 'Unable to destroy after all push' );

                        done();
                    });
                });
            });

            describe( '@callback', function(){
                it( 'receives a boolean true if, as the first argument ( if file exists AND the value was assigned )', function( done ){
                    file.push( 'key', 'updated_value', function( updated ){
                        updated.should.equal( true );
                        done();
                    });
                });

                it( 'receives boolean false, as the first argument ( if file does not exist )', function( done ){
                    file.name( 'fixtures/no_such_file', __dirname );
                    file.push( 'key', 'updated_value',  function( updated ){
                        updated.should.equal( false );

                        done();
                    });
                });

                it( 'receives the entire ( updated ) file data object, as the second argument ( if file exists )', function( done ){
                    file.push( 'key', 'updated_value', function( updated, updated_data ){
                        updated.should.equal( true );
                        updated_data.should.be.an.object;
                        updated_data.key.should.equal( 'updated_value' );
                        updated_data.deeply.buried.key.value.should.equal( "DEEP_VALUE" );
                        done();
                    });
                });

                it( 'receives null, as the second argument ( if file does not exist )', function( done ){
                    file.name( 'fixtures/no_such_file', __dirname  );
                    file.push( 'key', 'value',  function( updated, updated_data ){
                        updated.should.equal( false );
                        should( updated_data ).equal( null );

                        done();
                    });
                });
            });

            describe( '@behavior', function(){
                it( 'assigns a key\'s value within the file', function( done ){
                    file.push( 'key', 'updated_value', function( updated, updated_data ){
                        updated.should.equal( true );
                        console.log( updated_data );
                        updated_data.key.should.equal( 'updated_value' );
                        done();
                    });
                });

                it( 'assigns deep key values when provided a "dot" notation string', function( done ){
                    file.push( 'deeply.buried.key.value', 'UPDATED_DEEP_VALUE', function( updated, updated_data ){
                        updated_data.should.be.an.object;
                        updated_data.key.should.equal( 'value' );
                        updated_data.deeply.buried.key.value.should.equal( 'UPDATED_DEEP_VALUE' );
                        done();
                    });
                });
            });
        });
    });

    describe( 'Syncronous Instance Operation', function(){
        beforeEach( function(){ file = new File( false ); });

        describe( '#find()', function(){
            beforeEach( function(){
                file.name( 'fixtures/find_existing', __dirname );
                file.make();

                if( ! file.find()) throw new Error( 'Unable to create file before find' );
            });

            afterEach( function(){
                file.nuke();

                if( file.find()) throw new Error( 'Unable to destroy after find' );
            });

            after( function(){
                file.name( 'fixtures/find_existing', __dirname );
                file.nuke();

                if( file.find()) throw new Error( 'Unable to destroy after all find' );
            });

            it( 'returns boolean true if the file exists', function(){
                file.find().should.equal( true );
            });

            it( 'returns boolean false if the file does not exist', function(){
                file.name( 'fixtures/find_missing', __dirname );
                file.find().should.equal( false );
            });
        });

        describe( '#make()', function(){
            beforeEach( function(){
                file.name( 'fixtures/make_existing', __dirname );
                file.make();

                if( ! file.find()) throw new Error( 'Unable to create file before make' );
            });

            afterEach( function(){
                file.nuke();

                if( file.find()) throw new Error( 'Unable to destroy after make' );
            });

            after( function(){
                file.name( 'fixtures/make_existing', __dirname );
                file.nuke();

                if( file.find()) throw new Error( 'Unable to destroy after all make' );
            });

            it( 'returns boolean true if the file was created', function(){
                file.nuke().should.equal( true );
                file.find().should.equal( false );
                file.make().should.equal( true );
            } );

            it( 'returns boolean false if the file was not created', function(){
                file.make().should.equal( false );
            } );

            it( 'creates a file if it doesn\'t exist', function(){
                file.name( 'fixtures/make_missing', __dirname );
                file.find().should.equal( false );
                file.make().should.equal( true );
                file.find().should.equal( true );
            });

            it( 'doesn\'t affect existing files', function(){
                file.find().should.equal( true );
                file.make().should.equal( false );
            });
        });

        describe( '#copy()', function(){
            beforeEach( function(){
                file.name( 'fixtures/copy_existing', __dirname );
                file.make();

                if( ! file.find()) throw new Error( 'Unable to create file before copy' );
            });

            afterEach( function(){
                file.nuke();

                if( file.find()) throw new Error( 'Unable to destroy after copy' );
            });

            after( function(){
                file.name( 'fixtures/copy_existing', __dirname );
                file.nuke();

                if( file.find()) throw new Error( 'Unable to destroy after all copy' );
            });

            it( 'returns true if the copy was created', function(){

            });

            it( 'returns false if the copy was not created', function(){

            });

            it( 'creates a copy of the current file within the current file\'s directory', function(){

            });

            it( 'overwrites existing files', function(){

            });

            it( 'creates a copy, the contents of which, exactly match the original', function(){

            });

            it( 'does not change the current file path while executing', function(){

            });
        });

        describe( '#nuke()', function(){
            beforeEach( function(){
                file.name( 'fixtures/nuke_existing', __dirname );
                file.make();

                if( ! file.find()) throw new Error( 'Unable to create file before nuke' );
            });

            afterEach( function(){
                file.nuke();

                if( file.find()) throw new Error( 'Unable to destroy after nuke' );
            });

            after( function(){
                file.name( 'fixtures/nuke_existing', __dirname );
                file.nuke();

                if( file.find()) throw new Error( 'Unable to destroy after all nuke' );
            });

            it( 'returns boolean true if the file existed and was destroyed', function(){
                file.nuke().should.equal( true );
            });

            it( 'returns boolean false if the file did not exist', function(){
                file.name( 'fixtures/nuke_missing', __dirname );
                file.nuke().should.equal( false );
            });
        });

        describe( '#load()', function(){
            beforeEach( function(){
                file.name( 'fixtures/load_existing', __dirname );
                file.make();
                file.save({ key: 'value' });

                if( ! file.find()) throw new Error( 'Unable to create file before load' );
            });

            afterEach( function(){
                file.nuke();

                if( file.find()) throw new Error( 'Unable to destroy after load' );
            });

            after( function(){
                file.name( 'fixtures/load_existing', __dirname );
                file.nuke();

                if( file.find()) throw new Error( 'Unable to destroy after all load' );
            });

            it( 'returns the parsed contents of the file ( file existed )', function(){
                var loaded = file.load();
                loaded.should.be.an.object;
                loaded.should.deepEqual({ key: 'value' });
            });

            it( 'returns an empty object ( file was created )', function(){
                var loaded = file.load();
                loaded.should.be.an.object;
                loaded.should.deepEqual({ key: 'value' });
            });

            it( 'forces creation of a file that does not exist', function(){
                file.name( 'fixtures/load_missing', __dirname );
                file.find().should.equal( false );

                var loaded = file.load();
                loaded.should.be.an.object;
                loaded.should.not.have.any.properties;

                file.find().should.equal( true );
            });
        });

        describe( '#save()', function(){
            beforeEach( function(){
                file.name( 'fixtures/save_existing', __dirname );
                file.make();

                if( ! file.find()) throw new Error( 'Unable to create file before save' );
            });

            afterEach( function(){
                file.nuke();

                if( file.find()) throw new Error( 'Unable to destroy after save' );
            });

            after( function(){
                file.name( 'fixtures/save_existing', __dirname );
                file.nuke();

                if( file.find()) throw new Error( 'Unable to destroy after all save' );
            });

            it( 'returns a boolean true, if the data was saved into the file', function(){
                file.name( 'fixtures/save_existing', __dirname );
                file.save({ key: "value" }).should.equal( true );
                file.load().should.deepEqual({ key: "value" });
            });

            it( 'forces creation of a file that does not exist', function(){
                file.name( 'fixtures/save_missing', __dirname );
                file.find().should.equal( false );
                file.save({ key: "value" }).should.equal( true );
                file.find().should.equal( true );
            });
        });

        describe( '#pull()', function(){
            beforeEach( function(){
                file.name( 'fixtures/pull_existing', __dirname );
                file.make();
                file.save({ key: 'value', deeply: { buried: { key: { value: 'DEEP_VALUE' }}}});

                if( ! file.find()) throw new Error( 'Unable to create file before pull' );
            });

            afterEach( function(){
                file.nuke();

                if( file.find()) throw new Error( 'Unable to destroy after pull' );
            });

            after( function(){
                file.name( 'fixtures/pull_existing', __dirname );
                file.nuke();

                if( file.find()) throw new Error( 'Unable to destroy after all pull' );
            });

            describe( '@callback', function(){
                it( 'returns the value assigned to the key provided in the file if file & key exist', function(){
                    file.pull( 'key' ).should.equal( 'value' );
                });

                it( 'returns null if file/key does not exist', function(){
                    should( file.pull( 'no_such_key' )).equal( null );

                    file.name( 'fixtures/pull_missing', __dirname );
                    should( file.pull( 'inside_no_such_file') ).equal( null );
                });
            });

            describe( '@behavior', function(){
                it( 'loads a key\'s value from the file', function(){
                    file.pull( 'key' ).should.equal( 'value' );
                });

                it( 'locates deep keys when provided a "dot" notation string', function(){
                    file.pull( 'deeply.buried.key.value' ).should.equal( 'DEEP_VALUE' );
                });
            });
        });

        describe( '#push()', function(){
            beforeEach( function(){
                file.name( 'fixtures/push_existing', __dirname );
                file.make();
                file.save({ key: 'value', deeply: { buried: { key: { value: 'DEEP_VALUE' }}}});

                if( ! file.find()) throw new Error( 'Unable to create file before push' );
            });

            afterEach( function(){
                file.nuke();

                if( file.find()) throw new Error( 'Unable to destroy after push' );
            });

            after( function(){
                file.name( 'fixtures/push_existing', __dirname );
                file.nuke();

                if( file.find()) throw new Error( 'Unable to destroy after all push' );
            });

            it( 'returns a boolean true if file exists AND the value was assigned', function(){
                file.push( 'key', 'updated_value' ).should.equal( true );
            });

            it( 'receives boolean false if file does not exist', function(){
                file.name( 'fixtures/push_missing', __dirname );
                file.push( 'key', 'updated_value').should.equal( false );
            });

            it( 'assigns a key\'s value within the file', function(){
                file.push( 'key', 'updated_value' ).should.equal( true );
                var loaded = file.load();

                loaded.should.have.properties(['key']);
                loaded.key.should.equal( 'updated_value' );
            });

            it( 'assigns deep key values when provided a "dot" notation string', function(){
                file.push( 'deeply.buried.key.value', 'UPDATED_DEEP_VALUE');
                var loaded = file.load();
                loaded.should.be.an.object;
                loaded.key.should.equal( 'value' );
                loaded.deeply.buried.key.value.should.equal( 'UPDATED_DEEP_VALUE' );
            });
        });
    });
});