import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema({
    bannerImage: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        },
    },
})

const Banner = mongoose.model('Banner', BannerSchema)

export default Banner;