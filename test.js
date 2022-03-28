const gulp = require('gulp');
const size = require('.');
const Vinyl = require('vinyl');
const { Readable, Writable } = require('stream');
let stdoutSpy;

beforeEach(() => {
  stdoutSpy = jest.spyOn(process.stdout, 'write');
});

afterEach(() => {
  stdoutSpy.mockRestore();
});

describe('stream-size', () => {
  it('should work with gulp and a real file', (done) => {
    gulp
      .src('test.txt')
      .pipe(size())
      .pipe(gulp.dest('./'))
      .on('end', () => {
        expect(stdoutSpy).lastCalledWith(
          expect.stringContaining('test.txt: 27 B'),
          expect.anything()
        );
        done();
      });
  });

  it('should work with a Vinyl', done => {
    const stream = size();

    stream.write(new Vinyl({
      path: 'example.js',
      contents: Buffer.alloc(1234)
    }));

    stream.on('finish', () => {
      expect(stdoutSpy).lastCalledWith(
        expect.stringContaining('example.js: 1.23 kB'),
        expect.anything()
      );
      done();
    });

    stream.end();
  });

  it('should log gzipped size with gzip: true', done => {
    const stream = size({gzip: true});

    stream.write(new Vinyl({
      path: 'example.js',
      contents: Buffer.alloc(1234)
    }));

    stream.on('finish', () => {
      expect(stdoutSpy).lastCalledWith(
        expect.stringContaining('example.js: 1.23 kB (gzipped: 30 B)'),
        expect.anything()
      );
      done();
    });

    stream.end();
  });

  it('should log bytes rather than using filesize with bytes: true', done => {
    const stream = size({bytes: true});

    stream.write(new Vinyl({
      path: 'example.js',
      contents: Buffer.alloc(1234)
    }));

    stream.on('finish', () => {
      expect(stdoutSpy).lastCalledWith(
        expect.stringContaining('example.js: 1234 B'),
        expect.anything()
      );
      done();
    });

    stream.end();
  });

  it('should pass options to the filesize package', done => {
    const stream = size({base: 2});

    stream.write(new Vinyl({
      path: 'example.js',
      contents: Buffer.alloc(1234)
    }));

    stream.on('finish', () => {
      expect(stdoutSpy).lastCalledWith(
        expect.stringContaining('example.js: 1.21 KiB'),
        expect.anything()
      );
      done();
    });

    stream.end();
  });

  it('should run the callback function with it\'s parameter', done => {
    const stream = size({}, size => process.stdout.write(`${size}`));

    stream.write(new Vinyl({
      path: 'example.js',
      contents: Buffer.alloc(1234)
    }));

    stream.on('finish', () => {
      expect(stdoutSpy).lastCalledWith('1.23 kB');
      done();
    });

    stream.end();
  });

  it('should have filename, size, gzip props on the callback param', done => {
    const stream = size({}, info => process.stdout.write(
      `${info.filename}: ${info.size} (gzipped: ${info.gzip})`
    ));

    stream.write(new Vinyl({
      path: 'example.js',
      contents: Buffer.alloc(1234)
    }));

    stream.on('finish', () => {
      expect(stdoutSpy).lastCalledWith('example.js: 1.23 kB (gzipped: 30 B)');
      done();
    });

    stream.end();
  });

  /**
   * Checking if transformCallback() is run is tricky, so we just test (by not
   * timing out) that the stream 'finish' event happens, without any output, as
   * no output is expected when both isStream and isBuffer return false.
   */
  it('should run transformCallback() (even if no stream or buffer) ', done => {
    const stream = size();

    stream.write({isStream: () => false, isBuffer: () => false});

    stream.on('finish', () => {
      expect(stdoutSpy).not.toHaveBeenCalled();
      done();
    });

    stream.end();
  });
});
