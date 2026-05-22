import { describe, it, expect, vi } from 'vitest';
import AtlasTracking from '../src/index.js';

describe('trackThroughMessage', () => {
    it('merges override user/context into transmit payload', () => {
        const atlas = new AtlasTracking();

        atlas.config({
            system: {
                endpoint: 'example.test',
                apiKey: 'dummy-api-key',
                targetWindow: 'parent'
            },
            defaults: {},
            product: {},
            options: {
                trackClick: {},
                trackThroughMessage: {
                    enable: true
                }
            }
        });

        const pageUser = {
            user_id: 'base-user',
        };
        const pageContext = {
            url: 'https://example.test/base',
            page_title: 'base title',
            page_name: 'article',
            page_num: 1
        };

        atlas.initPage({
            user: pageUser,
            context: pageContext
        });

        const transmitSpy = vi.spyOn(atlas.utils, 'transmit').mockImplementation(() => {});
        window.dispatchEvent(new MessageEvent('message', {
            data: {
                isAtlasEvent: true,
                action: 'click',
                category: 'button',
                attributes: JSON.stringify({ cta: 'hero' }),
                userOverride: { user_id: 'override-user' },
                contextOverride: { url: 'https://example.test/override', page_num: 2 }
            }
        }));

        expect(transmitSpy).toHaveBeenCalledTimes(1);
        expect(transmitSpy).toHaveBeenCalledWith(
            'click',
            'button',
            expect.objectContaining({
                user_id: 'override-user',
            }),
            expect.objectContaining({
                url: 'https://example.test/override',
                page_name: 'article',
                page_num: 2
            }),
            { cta: 'hero' }
        );
        expect(pageUser.user_id).toBe('base-user');
        expect(pageContext.url).toBe('https://example.test/base');
    });
});
