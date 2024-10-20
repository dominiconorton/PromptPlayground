const toolbox = {
    kind: "categoryToolbox",
    contents: [
        {
            kind: "category",
            name: "Prompt",
            colour: "#5CA699",
            contents: [
                {
                    kind: "block",
                    type: "prompt_start"
                }
            ]
        },
        {
            kind: "category",
            name: "Content",
            colour: "#4CAF50",
            contents: [
                "story", "poem", "letter", "song_lyrics", "speech", "essay", "dialogue", "article", "joke", "riddle"
            ].map(type => ({ kind: "block", type: "content_" + type }))
        },
        {
            kind: "category",
            name: "Style",
            colour: "#FFC107",
            contents: [
                "fairy_tale", "mystery", "sci_fi", "comedy", "horror", "adventure", "fantasy", "romance", "thriller", 
                "dystopian", "historical_fiction", "mythology", "superhero", "western", "folklore", "detective", 
                "diary_entry", "fable", "steampunk", "post_apocalyptic"
            ].map(type => ({ kind: "block", type: "style_" + type }))
        },
        {
            kind: "category",
            name: "Constraint",
            colour: "#F44336",
            contents: [
                "100_words", "50_words", "3_characters", "future_setting", "include_dialogue", "first_person", 
                "end_with_question", "one_room", "only_adjectives", "5_minutes", "once_upon_a_time", "suspenseful_tone", 
                "2_sentences_per_paragraph", "magical_object", "third_person"
            ].map(type => ({ kind: "block", type: "constraint_" + type }))
        }
    ]
};

const workspace = Blockly.inject('blocklyDiv', {toolbox: toolbox});

// Block definitions
Blockly.Blocks['prompt_start'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Create a");
        this.appendValueInput("CONTENT")
            .setCheck("String");
        this.appendValueInput("STYLE")
            .setCheck("String")
            .appendField("in the style of");
        this.appendValueInput("CONSTRAINT")
            .setCheck("String")
            .appendField("with the constraint");
        this.setColour(210);
        this.setTooltip("Start your prompt here");
        this.setHelpUrl("");
    }
};

function createSimpleBlock(name, text, colour) {
    Blockly.Blocks[name] = {
        init: function() {
            this.appendDummyInput()
                .appendField(text);
            this.setOutput(true, "String");
            this.setColour(colour);
            this.setTooltip(text);
            this.setHelpUrl("");
        }
    };
}

// Content Blocks
["story", "poem", "letter", "song_lyrics", "speech", "essay", "dialogue", "article", "joke", "riddle"].forEach(type => {
    createSimpleBlock('content_' + type, type.replace('_', ' '), 90);
});

// Style Blocks
[
    "fairy_tale", "mystery", "sci_fi", "comedy", "horror", "adventure", "fantasy", "romance", "thriller", 
    "dystopian", "historical_fiction", "mythology", "superhero", "western", "folklore", "detective", 
    "diary_entry", "fable", "steampunk", "post_apocalyptic"
].forEach(type => {
    createSimpleBlock('style_' + type, type.replace('_', ' '), 60);
});

// Constraint Blocks
const constraints = {
    "100_words": "100 words",
    "50_words": "50 words",
    "3_characters": "No more than 3 characters",
    "future_setting": "Set in the future",
    "include_dialogue": "Must include dialogue",
    "first_person": "Written in first-person",
    "end_with_question": "Ends with a question",
    "one_room": "Takes place in one room",
    "only_adjectives": "Use only adjectives",
    "5_minutes": "Complete the story in 5 minutes",
    "once_upon_a_time": "Must begin with 'Once upon a time...'",
    "suspenseful_tone": "Keep the tone suspenseful",
    "2_sentences_per_paragraph": "No more than 2 sentences per paragraph",
    "magical_object": "Story must involve a magical object",
    "third_person": "Narration in third-person only"
};

Object.entries(constraints).forEach(([key, value]) => {
    createSimpleBlock('constraint_' + key, value, 0);
});

// Function to dynamically adjust overflow when menu opens or closes
function toggleOverflow(isMenuOpen) {
    var blocklyDiv = document.getElementById('blocklyDiv');
    if (isMenuOpen) {
        // Enable scrolling when the menu is open
        blocklyDiv.style.overflowY = 'auto';
    } else {
        // Hide overflow when the menu is closed
        blocklyDiv.style.overflowY = 'hidden';
    }
}

// Example listener for detecting toolbox state (open/closed)
workspace.addChangeListener(function(event) {
    if (event.type === Blockly.Events.TOOLBOX_ITEM_SELECT) {
        toggleOverflow(true); // Menu is opened
    } else if (event.type === Blockly.Events.TOOLBOX_ITEM_DESELECT) {
        toggleOverflow(false); // Menu is closed
    }
});

function generatePrompt() {
    const promptStart = workspace.getAllBlocks().find(block => block.type === 'prompt_start');
    
    if (promptStart) {
        const contentBlock = promptStart.getInputTargetBlock('CONTENT');
        const styleBlock = promptStart.getInputTargetBlock('STYLE');
        const constraintBlock = promptStart.getInputTargetBlock('CONSTRAINT');
        
        const content = contentBlock ? contentBlock.toString() : '[CONTENT]';
        const style = styleBlock ? styleBlock.toString() : '[STYLE]';
        const constraint = constraintBlock ? constraintBlock.toString() : '[CONSTRAINT]';
        
        const prompt = `Create a ${content} in the style of ${style} with the constraint: ${constraint}.`;
        document.getElementById('generated-prompt').textContent = prompt;
    } else {
        document.getElementById('generated-prompt').textContent = "Please start with a 'Create a' block.";
    }
}

function copyPrompt() {
    const promptText = document.getElementById('generated-prompt').textContent;
    navigator.clipboard.writeText(promptText).then(() => {
        alert('Prompt copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy prompt. Please try again.');
    });
}

function playPrompt() {
    const promptText = document.getElementById('generated-prompt').textContent;
    const rightTextBox = document.getElementById('rightTextBox');

    // Clear previous content
    rightTextBox.innerHTML = '';

    fetch('https://hook.eu1.make.com/nk3ighpl9x3vgiqx39motewkkclah2yd', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptText }),
    })
    .then(response => response.text())
    .then(data => {
        console.log('Successfully sent:', data);
        // Display the output in the rightTextBox
        rightTextBox.innerHTML = marked.parse(data);
    })
    .catch(error => {
        console.error('Error sending prompt:', error);
        // Display the error in the rightTextBox if there is an issue
        rightTextBox.innerHTML = '<p>Error: ' + error + '</p>';
    });
}
