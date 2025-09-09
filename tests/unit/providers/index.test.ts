import { InputProvider, ConfigProvider } from '../../../src/providers';
import { InputProvider as DirectInputProvider } from '../../../src/providers/input';
import { ConfigProvider as DirectConfigProvider } from '../../../src/providers/config';

describe('Providers Index', () => {
    describe('exports', () => {
        it('should export InputProvider', () => {
            expect(InputProvider).toBeDefined();
            expect(typeof InputProvider).toBe('function');
        });

        it('should export ConfigProvider', () => {
            expect(ConfigProvider).toBeDefined();
            expect(typeof ConfigProvider).toBe('function');
        });

        it('should export the same InputProvider as direct import', () => {
            expect(InputProvider).toBe(DirectInputProvider);
        });

        it('should export the same ConfigProvider as direct import', () => {
            expect(ConfigProvider).toBe(DirectConfigProvider);
        });

        it('should allow instantiation of InputProvider from index export', () => {
            const instance = new InputProvider();
            expect(instance).toBeInstanceOf(InputProvider);
            expect(instance).toBeInstanceOf(DirectInputProvider);
        });

        it('should allow instantiation of ConfigProvider from index export', () => {
            const instance = new ConfigProvider();
            expect(instance).toBeInstanceOf(ConfigProvider);
            expect(instance).toBeInstanceOf(DirectConfigProvider);
        });
    });

    describe('module structure', () => {
        it('should have all expected exports', () => {
            const providersModule = require('../../../src/providers');
            const expectedExports = ['InputProvider', 'ConfigProvider'];

            expectedExports.forEach(exportName => {
                expect(providersModule).toHaveProperty(exportName);
                expect(typeof providersModule[exportName]).toBe('function');
            });
        });

        it('should not have unexpected exports', () => {
            const providersModule = require('../../../src/providers');
            const actualExports = Object.keys(providersModule);
            const expectedExports = ['InputProvider', 'ConfigProvider'];

            expect(actualExports.sort()).toEqual(expectedExports.sort());
        });
    });
});
