import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MovieReview } from "../target/types/movie_review";
import { expect } from "chai";
import { getAssociatedTokenAddress, getAccount} from "@solana/spl-token"

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

    const [mint] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("mint")],
        program.programId
    );

    it("Initializes the reward token", async () => {
        const tx = await program.methods
            .initializeTokenMint()
            .rpc()
    })

    it("Movie review is added", async () => {
        const tokenAccount = await getAssociatedTokenAddress(
            mint,
            provider.wallet.publicKey
        );

        const tx = await program.methods
            .addMovieReview(movie.title, movie.description, movie.rating)
            .accounts({
                tokenAccount
            })
            .rpc();

        const account = await program.account
            .movieAccountState
            .fetch(moviePda);

        expect(account.title === movie.title);
        expect(account.description === movie.description);
        expect(account.rating === movie.rating);
        expect(account.reviewer === provider.publicKey);

        const userAta = await getAccount(provider.connection, tokenAccount);
        expect(Number(userAta.amount)).to.equal((10 * 10 ) ^ 6);
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
