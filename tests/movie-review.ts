import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MovieReview } from "../target/types/movie_review";
import { expect } from "chai";

describe("movie-review", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.MovieReview as Program<MovieReview>;

    const movie = {
        title: "LOTR",
        description: "excelente!!",
        rating: 4
    };

    const [moviePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from(movie.title), provider.wallet.publicKey.toBuffer()],
        program.programId
    );

    it("Movie review is added", async () => {
        const tx = await program.methods
            .addMovieReview(movie.title, movie.description, movie.rating)
            .rpc();

        const account = await program.account
            .movieAccountState
            .fetch(moviePda);

        expect(account.title === movie.title);
        expect(account.description === movie.description);
        expect(account.rating === movie.rating);
        expect(account.reviewer === provider.publicKey);
    })

    it("Movie review is updated", async () => {
        const modifiedMovie = {
            title: "LOTR",
            description: "Excelentisima!!!",
            rating: 5
        };

        const tx = await program.methods
            .updateMovieReview(
                modifiedMovie.title, 
                modifiedMovie.description, 
                modifiedMovie.rating
                )
            .rpc();

        const account = await program.account
            .movieAccountState
            .fetch(moviePda);

        expect(account.title === movie.title);
        expect(account.description === modifiedMovie.description);
        expect(account.rating === modifiedMovie.rating);
        expect(account.reviewer === provider.publicKey);
    })

    it("Movie review is deleted", async () => {
        const tx = await program.methods
            .deleteMovieReview(movie.title)
            .rpc()
    })

});
