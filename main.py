import random

def ai_response(number):
    responses = [
        f"You chose {number}. Interesting choice.",
        f"{number}?  Hmm, let me think about that.",
        f"The number {number} is... significant.",
        f"I've processed {number}.  The answer is 42.",  # Classic!
        f"{number}... that rings a bell.  Or maybe a doorbell."
    ]
    return random.choice(responses)

while True:
    try:
        user_input = input("Enter a number (or type 'exit' to quit): ")
        if user_input.lower() == 'exit':
            break
        number = int(user_input)  # Convert input to an integer
        print(ai_response(number))
    except ValueError:
        print("Invalid input. Please enter a number or 'exit'.")

