var Chart = function( config ){ this.init( config ); };
Chart.prototype = {
	constructor: Chart,

	_ready: false,
	_visible: false,
	_offset: 0,
	_lastHover: null,
	_animStateFns: {},

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
		this._sum = config.sum || 0;
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
		this._time = config.time || {
			show: 0,
			hide: 0
		};
		this._event = config.event || {};
		this._animArr = [];

		return true;
	},

	_buildParts: function(){
		var $this = this;

		this._min = this._data[0].val;
		this._max = 0;
		var sum = 0;

		this._each( this._data, function( key, val ){
			if( val.val < $this._min ) $this._min = val.val;
			if( val.val > $this._max ) $this._max = val.val;
			if( !this._sum ) sum += val.val;
		} );

		if( !this._sum ) this._sum = sum;

		this._partsArr = [];
		var partData, partOffset = this._offset;
		this._each( this._data, function( key, val ){
			partData = val;
			partData.relVal = $this._getRelVal( val.val, $this._sum );
			partData.offset = partOffset;
			partData.rootOffset = $this._offset;
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
			if( this._event.hoverChange ){
				if( hover !== null ){
					this._event.hoverChange( this._data[hover] );
				}else{
					this._event.hoverChange( null );
				}
			}
			this._lastHover = hover;
		}
	},

	show: function( cb, perPart, partCb ){
		this.anim( 'show', cb, perPart, partCb );
	},

	hide: function( cb, perPart, partCb ){
		this.anim( 'hide', cb, perPart, partCb );
	},

	anim: function( name, cb, perPart, partCb ){
		var anim = {
			name: name,
			b: null,
			e: null,
			time: null,
			cb: ( cb || null ),
			perPart: ( perPart || false ),
			partCb: ( partCb || null )
		};
		
		var k, ak = null;
		for( k in this._animArr ){
			if( this._animArr[k].name == name ){
				ak = k;
				break;
			}
		}

		if( ak === null ){
			this._animArr.push(anim);
		}else{
			this._animArr[ak] = anim;
		}
	},

	_partAnim: function( anim ){
		var $this = this;

		var offset = 0, partTime;
		this._each( this._partsArr, function( key, val ){
			if( anim.perPart ){
				partTime = $this._getPartTime( val.getVal(), $this._sum, anim, offset, 0 );
			}else{
				partTime = $this._getPartTime( 1, 1, anim, 0, 0 );
			}
			val.anim( anim.name, partTime, anim.partCb );
			offset += partTime.time;
		} );
	},

	_getPartTime: function( val, sum, anim, offset, over ){
		var partTime = anim.time * val / sum;

		return {
			b: anim.b + offset,
			e: anim.b + offset + partTime,
			time: partTime
		};
	},

	_updateAnim: function( t ){
		if( !this._ready ) return;
		
		var k, remArr = [];
		for( k in this._animArr ){

			if( this._animArr[k].b === null || this._animArr[k].e === null ){ // anim init - set time
				var animTime = this._time[this._animArr[k].name] || 0;
				this._animArr[k].b = t;
				this._animArr[k].e = t + animTime;
				this._animArr[k].time = animTime;
				this._partAnim( this._animArr[k] );
			}

			if( t >= this._animArr[k].e ){ // anim end
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
		this._animStateFns[name]( this, fract );
	},

	update: function( t ){
		if( !this._ready ) return;

		this._updateAnim( t );

		this._each( this._partsArr, function( key, val ){
			val.updateAnim( t );
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
