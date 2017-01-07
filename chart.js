var Chart = function( config ){ this.init( config ); };
Chart.prototype = {
	constructor: Chart,

	_ready: false,
	_offset: 0,
	_lastHover: null,

	init: function( config ){
		if( !this._setVars( config ) ) return;
		this._setEvents();
		this._buildParts();
		this.checkReady();
	},

	_setVars: function( config ){
		if( !window._ChartCore ) return false;
		if( !config ) return false;

		this._id = config.id || null;
		if( !this._id ) return false;

		this._canvasEl = document.getElementById( this._id );
		if( !this._canvasEl ) return false;
		this._ctx = this._canvasEl.getContext( '2d' );

		this._data = config.data || [];
		this._title = config.title || '';

		this._canvas = {};
		this._canvas.w = this._canvasEl.getAttribute( 'width' ) || 320;
		this._canvas.h = this._canvasEl.getAttribute( 'height' ) || 320;
		this._canvas.cx = this._canvas.w / 2;
		this._canvas.cy = this._canvas.h / 2;

		this._cursor = {};
		this._cursor.pos = {};
		this._cursor.pos.x = 0;
		this._cursor.pos.y = 0;
		// this._cursor.hit = false;

		this._size = config.size || {};
		this._event = config.event || {};

		return true;
	},

	_buildParts: function(){
		var $this = this;

		this._min = this._data[0].val;
		this._max = 0;
		this._sum = 0;

		this._each( this._data, function( key, val ){
			if( val.val < $this._min ) $this._min = val.val;
			if( val.val > $this._max ) $this._max = val.val;
			$this._sum += val.val;
		} );		

		this._partsArr = [];
		var partData, partOffset = this._offset;
		this._each( this._data, function( key, val ){
			partData = val;
			partData.relVal = $this._getRelVal( val.val, $this._sum );
			partData.offset = partOffset;
			$this._partsArr.push( $this._createPart( $this, partData ) );
			partOffset += partData.relVal;
		} );

	},

	_setEvents: function(){
		var $this = this;

		this._canvasEl.addEventListener('mouseenter', function(e){
			$this._mouseenterEvent( e );
		} );

		this._canvasEl.addEventListener('mousemove', function(e){
			$this._mousemoveEvent( e );
		} );

		this._canvasEl.addEventListener('mouseleave', function(e){
			$this._mouseleaveEvent( e );
		} );
	},

	_createPart: function( chart, partData ){
		return new ChartPart( chart, partData );
	},

	_getRelVal: function( val, sum ){
		return val;
	},

	_mouseenterEvent: function( e ){
		this._cursor.pos = this._recalcCursorPos( e );
	},

	_mousemoveEvent: function( e ){
		this._cursor.pos = this._recalcCursorPos( e );
	},

	_mouseleaveEvent: function( e ){
		this._cursor.pos = this._recalcCursorPos( e );
	},

	_recalcCursorPos: function( e ){	
		var offset = window._ChartCore._getOffset( this._canvasEl );
		return {
			x: ( e.pageX - offset.l ) * ( this._canvas.w / this._canvasEl.offsetWidth ),
			y: ( e.pageY - offset.t ) * ( this._canvas.h / this._canvasEl.offsetHeight )
		};
	},

	_each: function( arr, fn ){
		if( !arr.length ) return;
		if( typeof fn != 'function' ) return;
		var i;
		for( i = 0; i < arr.length; i++ ){
			fn( i, arr[i] );
		}
	},

	checkReady: function(){
		if( this._ready ) return;

		var allReady = true;
		this._each( this._partsArr, function( key, val ){
			if( !val.checkReady() ){
				allReady = false;
				return false;
			}
		} );

		if( allReady ){
			this._ready = true;
			window._ChartCore.addChart( this );
		}
	},

	checkHoverChange: function(){
		var $this = this;

		var hover = null;
		this._each( this._partsArr, function( key, val ){
			if( val.checkHover() ){
				hover = key;
				return false;
			}
		} );

		if( hover !== this._lastHover ){
			if( hover !== null ){
				this._event.hoverChange( this._data[hover] );
			}else{
				this._event.hoverChange( null );
			}
			this._lastHover = hover;
		}
	},

	update: function( t ){
		if( !this._ready ) return;
		this._each( this._partsArr, function( key, val ){
			val.update( t );
		} );
		this.checkHoverChange();
	},

	render: function(){
		if( !this._ready ) return;
		this._each( this._partsArr, function( key, val ){
			val.render();
		} );
	},

	clear: function(){
		this._ctx.clearRect( 0, 0, this._canvas.w, this._canvas.h );
	}

};

var ChartPart = function( chart, data ){ this.init( chart, data ); };
ChartPart.prototype = {
	constructor: ChartPart,

	_ready: false,
	_imgReady: false,
	_hover: false,

	init: function( chart, data ){
		if( !this._setVars( chart, data) ) return;
	},

	_setVars: function( chart, data ){
		this._chart = chart;
		this._ctx = chart._ctx;
		if( !data ) return false;
		this._val = data.val || 0;
		this._offset = data.offset || 0;
		this._color = data.color || '#000';
		this._imgSrc = data.img || null;
		this._canvas = chart._canvas;
		this._cursor = chart._cursor;
		this._size = chart._size;

		this._setStateVars( data );
		this._loadImage();

		return true;
	},

	_setStateVars: function( data ){
		var relVal = data.relVal || 0;

		this._state = {
			b: {
				val: 0
			},
			e: {
				val: relVal
			},
			c: {
				val: relVal
			}
		};
	},

	_loadImage: function(){
		var $this = this;

		if( !this._imgSrc ){ // no img

			this._img = null;
			this._ready = true;
			this._chart.checkReady();

		}else{ // img

			this._img = new Image();
			this._img.onload = function(){
				$this._imgReady = true;
				$this._ready = true;
				$this._chart.checkReady();
			};	
			this._img.src = this._imgSrc;

		}
	},

	checkImgReady: function(){
		return this._imgReady;
	},

	checkReady: function(){
		return this._ready;
	},

	checkHover: function(){
		return this._hover;
	},

	getVal: function(){
		return this._state.c.val;
	},

	setOffset: function( offset ){
		this._offset = offset;
	},

	update: function( t ){
		if( !this._ready ) return;

		this._checkHover( this._ctx, this._cursor.pos );
	},

	render: function(){
		if( !this._ready ) return;

		// draw
	},

	_checkHover: function( ctx, pos ){}

};
