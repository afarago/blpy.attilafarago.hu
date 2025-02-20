module.exports = {
    extends: 'lighthouse:default',
    settings: {
        skipAudits: ['color-contrast', 'link-name', 'label', 'robots-txt-is-valid'],
    },
};
