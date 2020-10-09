require('should');
const chai = require("chai");
const d3 = require("d3");
const expect = chai.expect;
const jsdom = require("jsdom");
const rn = require('random-number');
const KpiGauge = require('../dist/d3-kpi-gauge').KpiGauge;

// Tests for the KpiGauge class
describe('KpiGauge', () => {

  // Tests for the constructor
  describe('#constructor()', () => {
    it('should initialize the gauge correctly', () => {
      const rootElement = getRootElement();
      const config = {
        el: rootElement,
//        height: getPositiveNumber(),
        width: getPositiveNumber()
      };
      const kpiGauge = new KpiGauge(config);

//      kpiGauge._height.should.be.equal(config.height);
      kpiGauge._width.should.be.equal(config.width);

      kpiGauge._animationDelay.should.be.equal(0);
      kpiGauge._animationDuration.should.be.equal(3000);
      kpiGauge._barWidth.should.be.equal(20);
      kpiGauge._easeType.should.be.equal(d3.easeElastic);
      kpiGauge._needleRadius.should.be.equal(15);
//      expect(kpiGauge._sectionsColors).to.be.undefined;
//      expect(kpiGauge._needleColor).to.be.undefined;

      expect(kpiGauge.interval).to.eql([0, 1]);
      kpiGauge.percent.should.be.equal(0);

    });

    it('should initialize the gauge correctly when a valid animation delay is specified', () => {
      const config = {
        animationDelay: getPositiveOrZeroNumber(),
        el: getRootElement(),
        height: getPositiveNumber(),
        width: getPositiveNumber()
      };
      const kpiGauge = new KpiGauge(config);
      kpiGauge._animationDelay.should.be.equal(config.animationDelay);
    });

    it('should initialize the gauge correctly when a valid animation duration is specified', () => {
      const config = {
        animationDuration: getPositiveOrZeroNumber(),
        el:  getRootElement(),
        height: getPositiveNumber(),
        width: getPositiveNumber()
      };
      const kpiGauge = new KpiGauge(config);
      kpiGauge._animationDuration.should.be.equal(config.animationDuration);
    });

    it('should initialize the gauge correctly when a valid bar width is specified', () => {
      const config = {
        barWidth: getPositiveNumber(),
        el: getRootElement(),
        height: getPositiveNumber(),
        width: getPositiveNumber()
      };
      const kpiGauge = new KpiGauge(config);
      kpiGauge._barWidth.should.be.equal(config.barWidth);
    });

    it('should initialize the gauge correctly when a valid ease type is specified', () => {
      const config = {
        easeType: d3.easeLinear,
        el: getRootElement(),
        height: getPositiveNumber(),
        width: getPositiveNumber()
      };
      const kpiGauge = new KpiGauge(config);
      kpiGauge._easeType.should.be.equal(config.easeType);
    });

    it('should initialize the gauge correctly when a valid interval is specified', () => {
      const config = {
        el: getRootElement(),
        height: getPositiveNumber(),
        interval: [0, getPositiveNumber()],
        width: getPositiveNumber()
      };
      const kpiGauge = new KpiGauge(config);
      expect(kpiGauge.interval).to.eql(config.interval)
    });

    it('should initialize the gauge correctly when a valid needle color is specified', () => {
      const rootElement = getRootElement();
      const config = {
        el: rootElement,
        height: getPositiveNumber(),
        needleColor: '#f00',
        width: getPositiveNumber()
      };
      const kpiGauge = new KpiGauge(config);
      kpiGauge._needleColor.should.be.equal(config.needleColor);

//      rootElement.select('.needle').style('fill').should.be.equal(config.needleColor);
//      rootElement.select('.needle-center').style('fill').should.be.equal(config.needleColor);
    });

    it('should initialize the gauge correctly when a valid needle radius is specified', () => {
      const config = {
        el: getRootElement(),
        height: getPositiveNumber(),
        needleRadius: getPositiveOrZeroNumber(),
        width: getPositiveNumber()
      };
      const kpiGauge = new KpiGauge(config);
      kpiGauge._needleRadius.should.be.equal(config.needleRadius);
    });

    it('should initialize the gauge correctly when a valid percentage is specified', () => {
      const config = {
        el: getRootElement(),
        height: getPositiveNumber(),
        percent: 0.2,
        width: getPositiveNumber()
      };
      const kpiGauge = new KpiGauge(config);
      kpiGauge.percent.should.be.equal(config.percent/100);
    });

    it('should initialize the gauge correctly when a valid colors for the groups are specified', () => {
      const rootElement = getRootElement();
      const config = {
        el: rootElement,
        height: getPositiveNumber(),
        sectionsColors: [
          '#a00',
          '#0a0'
        ],
        width: getPositiveNumber()
      };
      const kpiGauge = new KpiGauge(config);
      expect(kpiGauge._sectionsColors).to.eql(config.sectionsColors);

      rootElement.selectAll('.arc')
        .each(function(d, i) {
          d3.select(this).style('fill').should.be.equal(config.sectionsColors[i])
        });
    });

    it('should throw an exception when the root element is invalid', () => {
      const config = {
        el: null,
        height: getPositiveNumber(),
        width: getPositiveNumber()
      };
      expect(() => new KpiGauge(config)).to.throw(Error, 'The element must be valid.');
    });

//    it('should throw an exception when the height specified is invalid', () => {
//      const config = {
//        el: getRootElement(),
//        height: 'invalid',
//        width: getPositiveNumber()
//      };
//      expect(() => new KpiGauge(config)).to.throw(RangeError, 'The height must be a positive number.');

//      config.height = getNegativeOrZeroNumber();
//      expect(() => new KpiGauge(config)).to.throw(RangeError, 'The height must be a positive number.');
//    });

//    it('should throw an exception when the sections count specified is invalid', () => {
//      const config = {
//        el: getRootElement(),
//        height: getPositiveNumber(),
//        width: getPositiveNumber()
//      };
//      expect(() => new KpiGauge(config)).to.throw(RangeError, 'The sections count must be a positive number.');

//      expect(() => new KpiGauge(config)).to.throw(RangeError, 'The sections count must be a positive number.');
//    });

    it('should throw an exception when the width specified is invalid', () => {
      const config = {
        el: getRootElement(),
        height: getPositiveNumber(),
        width: 'invalid'
      };
      expect(() => new KpiGauge(config)).to.throw(RangeError, 'The width must be a positive number.');

      config.width = getNegativeOrZeroNumber();
      expect(() => new KpiGauge(config)).to.throw(RangeError, 'The width must be a positive number.');
    });

    it('should throw an exception when the animation delay specified is invalid', () => {
      const config = {
        animationDelay: 'invalid',
        el: getRootElement(),
        height: getPositiveNumber(),
        width: getPositiveNumber()
      };
      expect(() => new KpiGauge(config)).to.throw(RangeError,
        'The transition delay must be greater or equal to 0.');

      config.animationDelay = getNegativeNumber();
      expect(() => new KpiGauge(config)).to.throw(RangeError,
        'The transition delay must be greater or equal to 0.');
    });

    it('should throw an exception when the animation duration specified is invalid', () => {
      const config = {
        animationDuration: 'invalid',
        el: getRootElement(),
        height: getPositiveNumber(),
        width: getPositiveNumber()
      };
      expect(() => new KpiGauge(config)).to.throw(RangeError,
        'The transition duration must be greater or equal to 0.');

      config.animationDuration = getNegativeNumber();
      expect(() => new KpiGauge(config)).to.throw(RangeError,
        'The transition duration must be greater or equal to 0.');
    });

    it('should throw an exception when the bar width specified is invalid', () => {
      const config = {
        barWidth: 'invalid',
        el: getRootElement(),
        height: getPositiveNumber(),
        width: getPositiveNumber()
      };
      expect(() => new KpiGauge(config)).to.throw(RangeError, 'The bar width must be a positive number.');

      config.barWidth = getNegativeOrZeroNumber();
      expect(() => new KpiGauge(config)).to.throw(RangeError, 'The bar width must be a positive number.');
    });

    it('should throw an exception when the needle radius specified is invalid', () => {
      const config = {
        el: getRootElement(),
        height: getPositiveNumber(),
        needleRadius: 'invalid',
        width: getPositiveNumber()
      };
      expect(() => new KpiGauge(config)).to.throw(RangeError, 'The needle radius must be greater or equal to 0.');

      config.needleRadius = getNegativeNumber();
      expect(() => new KpiGauge(config)).to.throw(RangeError, 'The needle radius must be greater or equal to 0.');
    });

//    it('should throw an exception when the sections colors length is not equal to sections count', () => {
//      const config = {
//        el: getRootElement(),
//        height: getPositiveNumber(),
//        sectionsColors: [
//          'green',
//          'red'
//        ],
//        width: getPositiveNumber()
//      };
//      expect(() => new KpiGauge(config)).to.throw(RangeError,
//    });
  });

  // Tests for 'interval' property
  describe('#interval', () => {
    it('should set the interval specified if it is valid', () => {
      const config = {
        el: getRootElement(),
        height: getPositiveNumber(),
        width: getPositiveNumber()
      };
      const intervalToSet = [0, getPositiveNumber()];
      const kpiGauge = new KpiGauge(config);
      kpiGauge.interval = intervalToSet;
      expect(kpiGauge.interval).to.eql(intervalToSet);
    });

    it('should throw an exception if the specified interval is invalid', () => {
      const config = {
        el: getRootElement(),
        height: getPositiveNumber(),
        width: getPositiveNumber()
      };
      const kpiGauge = new KpiGauge(config);
      expect(() => kpiGauge.interval = 'invalid').to.throw(Error, 'The interval specified is invalid.');
      expect(() => kpiGauge.interval = [1, 2, 3]).to.throw(Error, 'The interval specified is invalid.');
      expect(() => kpiGauge.interval = ['a', 'b']).to.throw(Error, 'The interval specified is invalid.');
      expect(() => kpiGauge.interval = [0, -100]).to.throw(Error, 'The interval specified is invalid.');
      expect(() => kpiGauge.interval = [100, 50]).to.throw(Error, 'The interval specified is invalid.');
    });
  });


  // this gauge is locked to 2 sections above and below KPI
  describe('#percent', () => {
    it('should set the percentage specified if it is valid', () => {
      const rootElement = getRootElement();
      const config = {
        el: rootElement,
        height: getPositiveNumber(),
        width: getPositiveNumber()
      };
      const kpiGauge = new KpiGauge(config);
      const group = rootElement.select('g');

      function validateActiveClass(index) {
        rootElement.selectAll('.arc').each(function(d, i) {
          const currentClass = d3.select(this).attr('class');
          if (i === index) {
            expect(currentClass).to.include('active');
          } else {
            expect(currentClass).does.not.include('active');
          }
        });
      }
      kpiGauge.percent = 0; //=============================================== 0%
      kpiGauge.percent.should.be.equal(0);
      validateActiveClass(0);
      expect(group.attr('class')).does.not.include('max');
      expect(group.attr('class')).to.include('min');

//      kpiGauge.percent = 0.25; //============================================ 25%
//      kpiGauge.percent.should.be.equal(0.25);
//      validateActiveClass(1);
//      expect(group.attr('class')).does.not.include(['min', 'max']);

//      kpiGauge.percent = 0.5; //============================================= 50%
//      kpiGauge.percent.should.be.equal(0.5);
//      validateActiveClass(2);
//      expect(group.attr('class')).does.not.include(['min', 'max']);

//      kpiGauge.percent = 0.75; //============================================ 75%
//      kpiGauge.percent.should.be.equal(0.75);
//      validateActiveClass(3);
//      expect(group.attr('class')).does.not.include(['min', 'max']);

      kpiGauge.percent = 1; //=============================================== 100%
      kpiGauge.percent.should.be.equal(1);
      validateActiveClass(1);
      expect(group.attr('class')).does.not.include('min');
      expect(group.attr('class')).to.include('max');
    });

    it('should throw an exception if the percentage specified is invalid', () => {
      const config = {
        el: getRootElement(),
        height: getPositiveNumber(),
        width: getPositiveNumber()
      };
      const kpiGauge = new KpiGauge(config);
      
      expect(() => kpiGauge.percent = 'invalid').to.throw(RangeError, 
        'The percentage must be between 0 and 1.');

      expect(() => kpiGauge.percent = getNegativeNumber()).to.throw(RangeError,
        'The percentage must be between 0 and 1.');
      
      expect(() => kpiGauge.percent = getPositiveNumber + 0.5).to.throw(RangeError,
        'The percentage must be between 0 and 1.');

    });
  });

  // Tests for 'value' setter
  describe('#value', () => {
    it('should set the value specified if it is valid', () => {
      const config = {
        el: getRootElement(),
        height: getPositiveNumber(),
        interval: [
          0,
          250
        ],
        width: getPositiveNumber()
      };
      const kpiGauge = new KpiGauge(config);
      kpiGauge.value = 0;
      kpiGauge.percent.should.be.equal(0);

      kpiGauge.value = 1;
      kpiGauge.percent.should.be.equal(1);
    });
    it('should throw an exception if the value specified is invalid', () => {
      const config = {
        el: getRootElement(),
        height: getPositiveNumber(),
        width: getPositiveNumber()
      };
      const kpiGauge = new KpiGauge(config);
      expect(() => kpiGauge.value = 'invalid').to.throw(Error, 'The specified value must be a number.');
    });
  });
});

/**
 * Generates a random negative number.
 */
const getNegativeNumber = rn.generator({
  integer: true,
  max: -1,
  min: -1000
});

/**
 * Generates a random negative number (including zero).
 */
const getNegativeOrZeroNumber = rn.generator({
  integer: true,
  max: 0,
  min: -1000
});

/**
 * Generates a random positive number.
 */
const getPositiveNumber = rn.generator({
  integer: true,
  max: 1000,
  min: 1
});

/**
 * Generates a random positive number (including zero).
 */
const getPositiveOrZeroNumber = rn.generator({
  integer: true,
  max: 1000,
  min: 0
});

// /**
//  * Generates a random positive small number.
//  */
// const getSmallPositiveNumber = rn.generator({
//   integer: true,
//   max: 10,
//   min: 1
// });

/**
 * Gets the root element of the gauge.
 *
 * @returns {*}   The root element of the gauge.
 */
function getRootElement() {
  const dom = new jsdom.JSDOM(`<!DOCTYPE html><svg></svg>`);
  return d3.select(dom.window.document.querySelector('svg'));
}

