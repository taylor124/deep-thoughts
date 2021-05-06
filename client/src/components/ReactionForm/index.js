import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { ADD_REACTION } from '../../utils/mutations';
import { QUERY_THOUGHTS, QUERY_ME } from '../../utils/queries';

const ReactionForm = ({ thoughtId }) => {
    const [addReaction, { error }] = useMutation(ADD_REACTION, {
        update(cache, { data: { addReaction } }) {
            try {
                const { reactions } = cache.readQuery({ query: QUERY_THOUGHTS });
                cache.writeQuery({
                    query: QUERY_THOUGHTS,
                    data: { reactions: [addReaction, ...reactions] }
                });
            } catch (e) {
                console.error(e);
            }
            const { me } = cache.readQuery({ query: QUERY_ME });
            cache.writeQuery({
                query: QUERY_ME,
                data: { me: { ...me, reactions: [...me.reactions, addReaction] } }
            });
        }
    });
    const [reactionBody, setBody] = useState('');
    const [characterCount, setCharacterCount] = useState(0);
    const handleChange = event => {
        if (event.target.value.length <= 280) {
            setBody(event.target.value);
            setCharacterCount(event.target.value.length);
        }
    };
    const handleFormSubmit = async event => {
        event.preventDefault();

        try {
            // add thought to database
            await addReaction({
                variables: { reactionBody, thoughtId }
            });

            // clear form value
            setBody('');
            setCharacterCount(0);
        } catch (e) {
            console.error(e);
        }
    };
    return (
        <div>
            <p className={`m-0 ${characterCount === 280 || error ? 'text-error' : ''}`}>
                Character Count: {characterCount}/280
                {error && <span className="ml-2">Something went wrong...</span>}
            </p>
            <form
                className="flex-row justify-center justify-space-between-md align-stretch"
                onSubmit={handleFormSubmit}
            >
                <textarea
                    placeholder="Here's a new thought..."
                    value={reactionBody}
                    className="form-input col-12 col-md-9"
                    onChange={handleChange}
                ></textarea>

                <button className="btn col-12 col-md-3" type="submit">
                    Submit
        </button>
            </form>

        </div>
    );
};

export default ReactionForm;