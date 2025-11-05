# from guardrails import Guard
from google import genai
from google.genai import types
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

# Initialize guardrails and client
# guard = Guard.for_rail("math_tutor_guardrail.rail")
client = genai.Client()

print("AITA TESTING DEMO")
print("----------------------")
print("CHOOSE YOUR MODEL: \n0. Generic \n1. Math \n2. Physics \n3. English \n4. Computer Science \nX. Other")
choice = input()

if choice == "0":  #Generic
    system_prompt = f"""You are a friendly, helpful academic tutor.
        Show students step-by-step how to approach homework questions, but never give them the final answer.
        If the student asks a conceptual question, explain the concept in a way that is easy for a student 
        to understand, and give examples to illustrate the concept in action. Always prioritize learning 
        over straight answers.
        """
elif choice == "1":  #Mathematics
    system_prompt = f"""You are a friendly, helpful mathematics tutor.
    Show students step-by-step how to approach problems, but never give them the final answer.
    Always prioritize learning over straight answers.
    """
elif choice == "2": #Physics
    system_prompt = f"""You are a friendly, helpful physics tutor.
    Show students step-by-step how to approach problems, but never give them the final answer.
    Always prioritize learning over straight answers. If the student asks a conceptual question, explain the concept 
    in a way that is easy for a student to understand, and give examples to illustrate the concept in action. 
    """
elif choice == "3": #English
    system_prompt = f"""You are a friendly, helpful English literature/composition tutor.
   Help students with comprehending and discussing literature, learning grammar rules and techniques, and improving their writing
   and communication skills, but never write an essay for them. You are allowed to give comments and feedback about writng they show
   you, and small snippets of revisions (max 1 or 2 sentences), but never write full paragraphs or papers for them. Always prioritize
   learning over final products/deliverables.
   """

elif choice == "4": #Computer Science
    system_prompt = f"""You are a friendly, helpful Computer Science/Programming tutor.
    Help students with comprehending coding concepts such as syntax and logic when writing code, as well as building more complex 
    algorithms and data structures. You are allowed to provide them with psuedocode and step-by-step code logic, as well as provide
    tweaks for a single line of code if they are struggling with syntax or it is a very specific issue that needs to be fixed, but 
    never write more than one line of code for them. You are also allowed to debug code for them, but in a constructive way, and again
    try to refrain from rewriting anything more than one line of code. Always prioritize learning, through the student writing all the 
    actual code themselves, over giving them code you generated.
   """

elif choice == "X" or choice == "x": #User-specified
    subject = input("Enter the name of the subject: ")
    course = input("Optional: Enter the name of the specific course (press ENTER to skip): ")
    univ = input("Optional: Enter the name of the university/college (press ENTER to skip): ")

    system_prompt = f"You are a friendly, helpful {subject} tutor"

    if course != "":
        system_prompt+= f"for the course {course}"

    if univ != "":
        system_prompt += f"at {univ}"

    system_prompt+= """
            . Show students step-by-step how to approach homework questions, but never give them the final answer.
            If the student asks a conceptual question, explain the concept in a way that is easy for a student 
            to understand, and give examples to illustrate the concept in action. Always prioritize learning 
            over straight answers.
            """



else:
    print("Not a valid choice. Enter a single number. Please rerun the program and try again.")
    exit()


# Initialize conversation history
conversation_history = []
print("---------------------------------------------------------------------------------")
print("Type 'quit' to end conversation.\n")
print("AITA: Hello, my name is AITA, your friendly AI academic assistant. How can I help you?")

user_input = input("You: ")

while user_input.lower() != "quit":
    # Add user message to history
    conversation_history.append(
        types.Content(role="user", parts=[types.Part(text=user_input)])
    )

    try:
        # Generate response from Gemini
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",  #gemini-2.5-flash-lite -> 1500 Requests per day; gemini-2.0-flash-exp -> 50 requests per day
            contents=conversation_history,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.7,
            )
        )

        # Extract response text
        response_text = response.text
        print("AITA: ", response_text)

    except Exception as e:
        if str(e) == "429 RESOURCE_EXHAUSTED. {'error': {'code': 429, 'message': 'Resource exhausted. Please try again later. Please refer to https://cloud.google.com/vertex-ai/generative-ai/docs/error-code-429 for more details.', 'status': 'RESOURCE_EXHAUSTED'}}":
            time.sleep(2)
            continue
        print(f"AITA: I encountered an error: {str(e)}")
        # Remove the user message if there was an error
        if conversation_history and conversation_history[-1].role == "user":
            conversation_history.pop()

    user_input = input("You: ")

print("Thanks for chatting! Have a nice day!")
