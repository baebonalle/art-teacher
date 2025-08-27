const analyzeButton = document.getElementById('analyzeButton');
const dropDown = document.getElementById('dropDown');
const dropBox = document.getElementById('dropBox');
const imageInput = document.getElementById('imageInput');
const answerParagraph = document.getElementById('answer');

document.addEventListener('DOMContentLoaded', () => {
  const dropDown = document.getElementById('analyzeButton');
  const selectedOptionSpan = document.getElementById('selectedOption');
  const analysisOptionSelect = document.getElementById('analysisOption');

  analysisOptionSelect.addEventListener('change', (event) => {
    const selectedOption = event.target.value;
    selectedOptionSpan.textContent = selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1);
  });
});

dropBox.addEventListener('drop', (event) => {
  event.preventDefault();
  dropBox.style.backgroundColor = '#f5f5f5';

  const files = event.dataTransfer.files;
  if (files.length > 0) {
    handleImage(files[0]);
  }
});

dropBox.addEventListener('click', () => {
  imageInput.click();
});

imageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    handleImage(file);
  }
});

function handleImage(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    answerParagraph.textContent = `Image uploaded: ${file.name}`;
  };
  reader.readAsDataURL(file);
}

analyzeButton.addEventListener('click', async () => {
  const imageInputFile = document.getElementById('imageInput').files[0];
  const questionInput = document.getElementById('questionInput').value;
  const answerElement = document.getElementById('answer');

  if (!imageInputFile || !questionInput) {
    answerElement.textContent = 'Please provide both an image and a question.';
    return;
  }

  const reader = new FileReader();
  reader.readAsDataURL(imageInputFile);
  reader.onload = async () => {
    const base64Image = reader.result.split(",")[1];

    try {
      const colorResponse = await axios.post('https://thebaibot.com/color_theory', {
        image: base64Image,
      });
      console.log('Color Analysis:', colorResponse.data);

      const hfResponse = await axios.post('https://thebaibot.com/huggingface', {
        image: base64Image,
        question: questionInput
      });

      console.log('Hugging Face Response:', hfResponse.data);

      const finalResponse = await axios.post('https://thebaibot.com/mistralapi', {
        input: `Please tell me which color palette is used in my drawing. Here is my color palette in RGB format: ${JSON.stringify(colorResponse.data)}. Here is a brief description of it: ${JSON.stringify(hfResponse.data)}. Here is some added information about it: ${questionInput}. Provide suggestions on how I can improve. Do NOT mention the specific RGB values, or quote the text I gave you. Instead, pretend like you are seeing the painting in real life, and critiquing it as my art teacher. Keep it under 100 words.`
      });      
      
      console.log('Analysis:', finalResponse.data.result);
      answerElement.innerHTML = `${finalResponse.data.result}<br>
    `;    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      answerElement.textContent = 'Error: ' + (error.response?.data?.error || error.message);
    }
  };
});

