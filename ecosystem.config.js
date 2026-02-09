module.exports = {
    apps: [
        {
            name: 'casf-radio',
            script: 'node_modules/next/dist/bin/next',
            args: 'start -p 6767',
            instances: 'max',
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'production',
                AUTH_TRUST_HOST: 'true',
                AUTH_URL: 'https://radio.makesoft.io',
            },
        },
    ],
};
