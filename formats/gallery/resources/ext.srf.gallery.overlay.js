/**
 * JavaSript for SRF gallery overlay/fancybox module
 *
 * There is a method ImageGallery->add which allows to override the
 * image url but this feature is only introduced in MW 1.20 therefore
 * we have to catch the "real" image location url from the api to be able
 * to display the image in the fancybox
 *
 * jshint checked; full compliance
 *
 * @licence: GNU GPL v2 or later
 * @author:  mwjames
 *
 * @since: 1.8
 *
 * @release: 0.2
 */
( function( $ ) {

	// jshint compliance
	/*global mw:true*/
	"use strict";

	try { console.log('console ready'); } catch (e) { var console = { log: function () { } }; }

	$.fn.galleryOverlay = function( options ) {
		var galleryID = this.attr( 'id' ),
			srfPath = mw.config.get( 'srf.options' ).srfgScriptPath;

		var _this = this;

		// API image url fetch (see Jeroen's SF image preview)
		this.getImageURL = function( title , callback ) {
			$.getJSON(
				mw.config.get( 'wgScriptPath' ) + '/api.php',
				{
					'action': 'query',
					'format': 'json',
					'prop'  : 'imageinfo',
					'iiprop': 'url',
					'titles': 'File:' + title
				},
				function( data ) {
					if ( data.query && data.query.pages ) {
						var pages = data.query.pages;
						for ( var p in pages ) {
							if ( pages.hasOwnProperty( p ) ) {
								var info = pages[p].imageinfo;
								for ( var i in info ) {
									if ( info.hasOwnProperty( i ) ) {
										callback( info[i].url );
										return;
									}
								}
							}
						}
					}
					callback( false );
				}
			);
		};

		// Loop over all relevant gallery items
		this.find( '.gallerybox' ).each( function () {
			var $this   = $( this ),
				image     = $this.find( 'a.image' ),
				imageText = $this.find( '.gallerytext p' ).html(),
				zoomicon  = '<span class="zoomicon"></span>';

			// Group images
			image.attr( 'rel', image.has( 'img' ).length ? galleryID : '' );

			// Copy text information for image text display
			imageText = imageText !== null ? imageText :  image.find( 'img' ).attr( 'alt' );
			image.attr( 'title', imageText );

			// There should be a better way to find the title object but there isn't
			var title = image.attr( 'href' ).replace(/.+?\File:(.*)$/, "$1" ).replace( "%27", "\'" );

			// Assign image url
			_this.getImageURL( title ,
					function( url ) { if ( url === false ) {
						image.attr( 'href', '' );
					} else {
						image.attr( 'href', url );
						// Add overlay zoom icon placeholder
						image.prepend( zoomicon );
					}
			} );
		} );

		// Formatting the title
		function formatTitle( title, currentArray, currentIndex, currentOpts ) {
			return '<div class="srf-fancybox-title"><span class="button"><a href="javascript:;" onclick="$.fancybox.close();"><img src=' +  srfPath + '/resources/jquery.fancybox/closelabel.gif' + '></a></span>' + (title && title.length ? '<b>' + title : '' ) + '<span class="count"> (' +  mw.msg( 'srf-gallery-overlay-count', (currentIndex + 1) , currentArray.length ) + ')</span></div>';
		}

		// Display all images related to a group
		this.find( "a[rel^=" + galleryID + "]" ).fancybox( {
			'showCloseButton' : false,
			'titlePosition'   : 'inside',
			'titleFormat'     : formatTitle
		} );
	};

	// DOM
	$(document).ready(function() {
		$( ".srf-overlay" ).each(function() {
			$( this ).galleryOverlay();
		} );
	} );
} )( window.jQuery, window.mediaWiki );