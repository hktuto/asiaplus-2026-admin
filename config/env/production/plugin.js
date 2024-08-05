module.exports = ({env}) => ({
    upload: {
        config: {
          provider: "strapi-provider-upload-do", 
          providerOptions: {
            key: env('DO_SPACE_ACCESS_KEY'),
            secret: env('DO_SPACE_SECRET_KEY'),
            endpoint: env('DO_SPACE_ENDPOINT'),
            space: env('DO_SPACE_BUCKET'),
            directory: env('DO_SPACE_DIRECTORY'),
            cdn: env('DO_SPACE_CDN'),
          },
          breakpoints: {
            xlarge: 1920,
            large: 1000,
            medium: 750,
            small: 500,
            xs: 256,
            thumbnail: 128,
    
          },
        },
      },
})