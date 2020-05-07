/**
* d3-KPI-gauge.js | MIT license
* 
* The code is based on this example (https://codepen.io/anon/pen/WKyXgr)
* on CodePen and on this tutorial (https://jaketrent.com/post/rotate-gauge-needle-in-d3/).
* 
* I refactored the code of the example to make it work with D3.js v5, and I restructured
* the code to make it more flexible.
* 
* Thanks to the original author for its work.
* 
* gulp requires CLI version 2.1.0, to secure this run gulp as follows
* 
*./node_modules/gulp/bin/gulp.js
* 
* the above gulp command will run as watcher.
* 
*/

import 'd3-transition';
import { arc as d3Arc } from 'd3-shape';
import { easeElastic } from 'd3-ease';
import { range } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';

const CONSTANTS = {
	BAR_WIDTH: 20,
	CHAR_INSET: 10,
	EASE_TYPE: easeElastic,
	FONT_SIZE: '10pt',
	KPI: 25,
	NEEDLE_ANIMATION_DELAY: 0,
	NEEDLE_ANIMATION_DURATION: 3000,
	NEEDLE_COLORS: ['rgba(0, 148, 0, 1)','rgba(225, 0, 0, 1)'],
	NEEDLE_RADIUS: 15,
	SECTION_COLORS: ['rgba(0, 148, 0, 1)','rgba(225, 0, 0, 1)']
};

const percToDeg = perc => perc * 360;
const degToRad = deg => deg * Math.PI / 180;
const percToRad = perc => degToRad( percToDeg( perc ) );

//const radToDeg = rad => rad * 180 / Math.PI;

/**
* Defines the needle used in the gauge.
*/
class Needle {
	/**
	* Initializes a new instance of the Needle class.
	*
	* @param config The configuration to use to initialize the needle.
	* @param config.animationDelay The delay in ms before to start the needle animation.
	* @param config.animationDuration The duration in ms of the needle animation.
	* @param config.color The color to use for the needle.
	* @param config.easeType The ease type to use for the needle animation.
	* @param config.el The parent element of the needle.
	* @param config.kpi The defined gauge kpi percentage limit.
	* @param config.length The length of the needle.
	* @param config.percent The initial percentage to use.
	* @param config.radius The radius of the needle.
	*/
	constructor(config) {
		this._animationDelay = config.animationDelay;
		this._animationDuration = config.animationDuration;
		this._color = config.color;
		this._easeType = config.easeType;
		this._el = config.el;
		this._kpi = config.kpi;
		this._length = config.length;
		this._percent = config.percent;
		this._radius = config.radius;
		this._fontsize = config.fontsize;
		this._initialize();
	}

	/**
	* Updates the needle position based on the percentage specified.
	*
	* @param percent The percentage to use.
	*/
	update(percent) {
		const self = this;
		let color = '';

		// set needle color according to kpi value
		if( (this._kpi / 100) >= percent) color = this._color[0];
		else color = this._color[1];
		this._el.select('.needle-center').style('fill', color);
		this._el.select('.needle').style('fill', color);
		this._el.select('.needle-text').text( Math.floor( percent * 100 ) + '%' );

		this._el.transition()
		.delay(this._animationDelay)
		.ease(this._easeType)
		.duration(this._animationDuration)
		.selectAll('.needle')
		.tween('progress', function () {
			const thisElement = this;
			const delta = percent - self._percent;
			const initialPercent = self._percent;
			return function (progressPercent) {
				self._percent = initialPercent + progressPercent * delta;
				return select(thisElement)
				.attr('d', self._getPath(self._percent));
			}
		});
	}

	/**
	* Initializes the needle.
	*
	* @private
	*/
	_initialize() {
		this._el.append('circle')
			.attr('class', 'needle-center')
			.attr('cx', 0).attr('cy', 0)
			.attr('r', this._radius);
		
		this._el.append('path')
			.attr('class', 'needle')
			.attr('d', this._getPath(this._percent));
		
		const fontSize = this._fontsize;
		
		this._el.append('text')
			.attr('class', 'needle-text')
			.attr('text-anchor', 'middle')
			.attr('font-size', fontSize)
			.attr('font-weight', 'bold')
			.style('fill', 'rgb(255,255,0)')
			.attr('y',10)
			.text( Math.floor( this._percent * 100 ) + '%' );

		const needleColor = ( (this._kpi / 100) >= this._percent ) ? this._color[0] : this._color[1];

		this._el.select('.needle-center').style('fill', needleColor);
		this._el.select('.needle').style('fill', needleColor);
	}

	/**
	* Gets the needle path based on the percent specified.
	*
	* @param percent The percentage to use to create the path.
	* @returns {string} A string associated with the path.
	* @private
	*/
	_getPath(percent) {
		const halfPI = Math.PI / 2;
		const thetaRad = percToRad(percent / 2); // half circle

		const centerX = 0;
		const centerY = 0;

		// shorten butt-ended +/- 0.01
		const topXleft = centerX - ( this._length * Math.cos(thetaRad - 0.01 ) );
		const topYleft = centerY - ( this._length * Math.sin(thetaRad - 0.01 ) );
		const topXright = centerX - ( this._length * Math.cos(thetaRad + 0.01 ) );
		const topYright = centerY - ( this._length * Math.sin(thetaRad + 0.01 ) );

		// move needle base slightly from circle center (+/- 0.25) and widen gap to touch circle tangent (+ 0.35)
		const leftX = centerX - ( (this._radius + 0.35) * Math.cos(thetaRad - halfPI + 0.25) );
		const leftY = centerY - ( (this._radius + 0.35) * Math.sin(thetaRad - halfPI + 0.25) );
		const rightX = centerX - ( (this._radius + 0.35) * Math.cos(thetaRad + halfPI - 0.25) );
		const rightY = centerY - ( (this._radius + 0.35) * Math.sin(thetaRad + halfPI - 0.25) );

		return `M ${leftX} ${leftY} L ${topXleft} ${topYleft} L ${topXright} ${topYright} L ${rightX} ${rightY}`;
	}
}

/**
* Defines a KPI gauge.
*/
export class KpiGauge {
	/**
	* Initializes a new instance of the KpiGauge class.
	*
	* @param config The configuration to use to initialize the gauge.
	* @param [config.animationDelay] The delay in ms before to start the needle animation. By default, the value
	* is 0.
	* @param [config.animationDuration] The duration in ms of the needle animation. By default, the value is 3000.
	* @param [config.barWidth] The bar width of the gauge. By default, the value is 40.
	* @param [config.chartInset] The char inset to use. By default, the value is 10.
	* @param [config.easeType] The ease type to use for the needle animation. By default, the value is
	* "d3.easeElastic".
	* @param config.el The D3 element to use to create the gauge (must be a group or an SVG element).
	* @param config.height The height of the gauge.
	* @param [config.interval] The interval (min and max values) of the gauge. By default, the interval
	* is [0, 1].
	* @param [config.needleColor] The needle colors array of two colors, 
				default [rgba(0,148,0,1), rgba(255,0,0,1)] ( [green,red] ).
	* @param [config.needleRadius] The radius of the needle. By default, the radius is 15.
	* @param [config.percent] The percentage to use for the needle position. By default, the value is 0.
	* @param [config.sectionsColors] The color to use for each section.
	* @param config.width The width of the gauge.
	*/
	constructor(config) {
		if (!config.el) { throw new Error('The element must be valid.'); }
		if (isNaN(config.height) || config.height <= 0) { throw new RangeError('The height must be a positive number.'); }
		if (isNaN(config.width) || config.width <= 0) { throw new RangeError('The width must be a positive number.'); }
		if (config.animationDelay !== undefined && (isNaN(config.animationDelay) || config.animationDelay < 0)) {
			throw new RangeError('The transition delay must be greater or equal to 0.');
		}
		if (config.animationDuration !== undefined && (isNaN(config.animationDuration) || config.animationDuration < 0)) {
			throw new RangeError('The transition duration must be greater or equal to 0.');
		}
		if (config.barWidth !== undefined && (isNaN(config.barWidth) || config.barWidth <= 0)) {
			throw new RangeError('The bar width must be a positive number.');
		}
		if (config.chartInset !== undefined && (isNaN(config.chartInset) || config.chartInset < 0)) {
			throw new RangeError('The chart inset must be greater or equal to 0.');
		}
		if (config.needleRadius !== undefined && (isNaN(config.needleRadius) || config.needleRadius < 0)) {
			throw new RangeError('The needle radius must be greater or equal to 0.');
		}

		this._animationDelay = (config.animationDelay !== undefined) ? 
					config.animationDelay : CONSTANTS.NEEDLE_ANIMATION_DELAY;
		this._animationDuration = (config.animationDuration !== undefined) ? 
					config.animationDuration : CONSTANTS.NEEDLE_ANIMATION_DURATION;
		this._chartInset = (config.chartInset !== undefined) ? config.chartInset : CONSTANTS.CHAR_INSET;
		this._needleRadius = (config.needleRadius !== undefined) ? config.needleRadius : CONSTANTS.NEEDLE_RADIUS;
		this.percent = (config.percent !== undefined) ? config.percent / 100 : 0;
		this._fontsize = (config.fontsize !== undefined) ? config.fontsize : CONSTANTS.FONT_SIZE;
		this._barWidth = config.barWidth || CONSTANTS.BAR_WIDTH;
		this._easeType = config.easeType || CONSTANTS.EASE_TYPE;
		this._sectionsColors = config.sectionsColors || CONSTANTS.SECTION_COLORS;
		this._needleColor = config.needleColor || CONSTANTS.NEEDLE_COLORS;
		this._el = config.el;
		this._height = config.height;
		this._width = config.width;
		this._kpi = config.kpi;
		this.interval = config.interval || [0, 1];
		this._initialize();
	}

	/**
	* Gets the interval of the gauge.
	*
	* @returns {Array} An array of two elements that represents the min and the max values of the gauge.
	*/
	get interval() {
		return this._scale.domain();
	}

	/**
	* Sets the interval of the gauge (min and max values).
	*
	* @param interval
	*/
	set interval(interval) {
		if (!(interval instanceof Array) || 
			interval.length !== 2 || 
			isNaN(interval[0]) || 
			isNaN(interval[1]) || 
			interval[0] > interval[1]) {
			throw new Error('The interval specified is invalid.');
		}
		this._scale = scaleLinear().domain(interval).range([0, 1]).clamp(true);
	}

	/**
	* Gets the needle percent.
	*
	* @returns {number|*} The percentage position of the needle.
	*/
	get percent() {
		return this._percent;
	}

	/**
	* Sets the needle percent. The percent must be between 0 and 1.
	*
	* @param percent The percentage to set.
	*/
	set percent(percent) {
		if (isNaN(percent) || percent < 0 || percent > 1) {
			throw new RangeError('The percentage must be between 0 and 1.');
		}
		if (this._needle) { this._needle.update(percent); }
		this._percent = percent;
		this._update();
	}

	/**
	* Sets the needle position based on the specified value inside the interval.
	* If the value specified is outside the interval, the value will be
	* clamped to fit inside the domain.
	*
	* @param value The value to use to set the needle position.
	*/
	set value(value) {
		if (isNaN(value)) { throw new Error('The specified value must be a number.'); }
		this.percent = value;
	}

	/**
	* Initializes the KPI gauge.
	*
	* @private
	*/
	_initialize() {
		const radius = Math.min(this._width, this._height * 2) / 2;

		let arcStartRad = 0;
		let arcEndRad = 0;

		this._chart = this._el.append('g').attr('transform', `translate(${this._width / 2}, ${this._height-10})`);
		this._arcs = this._chart.selectAll('.arc')
			// two arcs one for the KPI percentage green values, and the rest for values outside the KPI red values
			.data(range(1, 3))
			.enter()
			.append('path')
			.attr('class', sectionIndex => `arc chart-color${sectionIndex}`)
			.attr('d', sectionIndex => {
				if(sectionIndex == 1){ // Green value arc
					arcStartRad = degToRad( 270 ); // start at 270°
					arcEndRad = degToRad( 270 + percToDeg( this._kpi/100/2 ) - percToDeg( 0.4/100/2 ) ); 
				}
				else{ // Red value arc
					arcStartRad = degToRad( 270 + percToDeg( this._kpi/100/2 ) + percToDeg( 0.4/100/2 ) );
					arcEndRad = degToRad( 450 );
				}

				const arc = d3Arc()
				.outerRadius(radius - this._chartInset)
				.innerRadius(radius - this._chartInset - this._barWidth)
				.startAngle(arcStartRad)
				.endAngle(arcEndRad);

				return arc(this);
			});

		if (this._sectionsColors) {
			this._arcs.style('fill', sectionIndex => this._sectionsColors[sectionIndex - 1]);
		}

		this._needle = new Needle({
			animationDelay: this._animationDelay,
			animationDuration: this._animationDuration,
			color: this._needleColor,
			easeType: this._easeType,
			el: this._chart,
			fontsize: this._fontsize,
			kpi: this._kpi,
			length: radius - this._chartInset - this._barWidth - 5,
			percent: this._percent,
			radius: this._needleRadius
		});
		this._update();
	}

	/**
	* Updates the active arc and the gauge status (min or max) based on the current percent.
	*
	* @private
	*/
	_update() {
		if (!this._arcs) { return; }
		this._arcs
		.classed('active', (d, i) => i === Math.floor(this._percent) || i === this._arcs.size() - 1 && this._percent === 1);
		this._chart.classed('min', this._percent === 0);
		this._chart.classed('max', this._percent === 1);
	}
}