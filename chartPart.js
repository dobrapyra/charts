var ChartPart = function( chart, data ){ this.init( chart, data ); };
ChartPart.prototype = {
	constructor: ChartPart,

	_ready: false,
	_imgReady: false,
	_visible: false,
	_hover: false,
	_animStateFns: {},

	_easingFns: {
		easeInQuad: function(f){
			return f * f;
		},
		easeOutQuad: function(f){
			f = 1 - f;
			return 1 - ( f * f );
		},
		easeInOutQuad: function(f){
			f *= 2;
			if( f <= 1 ){
				return ( f * f ) / 2;
			}else{
				f = 2 - f;
				return 1 - ( ( f * f ) / 2 );
			}
		},
		easeInCubic: function(f){
			return f * f * f;
		},
		easeOutCubic: function(f){
			f = 1 - f;
			return 1 - ( f * f * f );
		},
		easeInOutCubic: function(f){
			f *= 2;
			if( f <= 1 ){
				return ( f * f * f ) / 2;
			}else{
				f = 2 - f;
				return 1 - ( ( f * f * f ) / 2 );
			}
		},
		easeInQuart: function(f){
			return f * f * f * f;
		},
		easeOutQuart: function(f){
			f = 1 - f;
			return 1 - ( f * f * f * f );
		},
		easeInOutQuart: function(f){
			f *= 2;
			if( f <= 1 ){
				return ( f * f * f * f ) / 2;
			}else{
				f = 2 - f;
				return 1 - ( ( f * f * f * f ) / 2 );
			}
		}
	},

	init: function( chart, data ){
		if( !this._setVars( chart, data) ) return;
	},

	_setVars: function( chart, data ){
		this._chart = chart;
		this._ctx = chart._ctx;
		if( !data ) return false;
		this._val = data.val || 0;
		this._label = data.label || '';
		this._offset = data.offset || 0;
		this._rootOffset = data.rootOffset || 0;
		this._relOffset = this._offset - this._rootOffset;
		this._color = data.color || '#000';
		this._imgSrc = data.img || null;
		this._canvas = chart._canvas;
		this._cursor = chart._cursor;
		this._size = chart._size;
		this._animArr = [];

		this._setStateVars( data );
		this._loadImage();

		return true;
	},

	_setStateVars: function( data ){
		var relVal = data.relVal || 0;

		this._state = {
			val: relVal
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
		return this._val;
	},

	getState: function(){
		return this._state.c;
	},

	anim: function( name, time, cb ){
		var anim = {
			name: name,
			b: time.b || null,
			e: time.e || null,
			time: time.time || null,
			cb: cb
		};
		
		var k, ak = null;
		for( k in this._animArr ){
			if( this._animArr[k].name == name ){
				ak = k;
				break;
			}
		}

		this._setAnimState( name, 0 );

		if( ak === null ){
			this._animArr.push(anim);
		}else{
			this._animArr[ak] = anim;
		}
	},
	
	stopAnim: function( name ){

		var k, ak = null;
		for( k in this._animArr ){
			if( this._animArr[k].name == name ){
				ak = k;
				break;
			}
		}

		if( ak !== null ){
			this._animArr.splice(ak, 1);
		}
	},

	updateAnim: function( t ){
		if( !this._ready ) return;

		var k, remArr = [];
		for( k in this._animArr ){

			if( this._animArr[k].b === null || this._animArr[k].e === null ){ // anim init - set time
				var animTime = this._chart.getTime( this._animArr[k].name );
				this._animArr[k].b = t;
				this._animArr[k].e = t + animTime;
				this._animArr[k].time = animTime;
			}

			if( t >= this._animArr[k].e ){ // anim end
				this._setAnimState( this._animArr[k].name, 1 );
				remArr.push( this._animArr[k] );
				if( typeof( this._animArr[k].cb ) == 'function' ){
					this._animArr[k].cb();
				}
				continue;
			}

			if( t >= this._animArr[k].b ){ // anim
				this._setAnimState( this._animArr[k].name, ( ( t - this._animArr[k].b ) / this._animArr[k].time ) );
			}

		}

		for( k in remArr ){
			this._animArr.splice( this._animArr.indexOf( remArr[k] ), 1 );
		}
	},

	_setAnimState: function( name, fract ){
		if( !this._animStateFns[name] ) return;
		fract = this._easingFns.easeOutQuad( fract );
		this._animStateFns[name]( this, fract );
	},

	update: function( t ){
		if( !this._ready ) return;

		this._checkHover( this._ctx, this._cursor.pos );
	},

	render: function(){
		if( !this._ready ) return;

		// draw
	},

	_checkHover: function( ctx, pos ){}	// should set this._hover

};
