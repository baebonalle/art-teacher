const analyzeButton = document.getElementById('analyzeButton');
const dropBox = document.getElementById('dropBox');
const imageInput = document.getElementById('imageInput');
const answerParagraph = document.getElementById('answer');

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
  const imageInputFile = imageInput.files[0];
  const questionInput = document.getElementById('questionInput').value;

  if (!imageInputFile || !questionInput) {
    answerParagraph.textContent = 'Please provide both an image and a question.';
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

      const rawColors = colorResponse.data.result;
      console.log("Raw colors:", rawColors);

      const colors = String(rawColors)
        .trim()
        .replace(/^\[\[/, "")
        .replace(/\]\]$/, "")
        .split(/\]\s*\[/)
        .map(row =>
          row.trim().split(/\s+/).map(Number)
        );
      
      console.log("Parsed colors:", colors);

      const paletteResponse = await axios.post('https://thebaibot.com/mistralapi', {
        input: `Please tell me which color palette is used in my drawing: ex, complementary, analogous, triadic, etc. Here is my color palette in RGB format: ${JSON.stringify(colorResponse.data)}.`
      }); 

      const analysisResponse = await axios.post('https://thebaibot.com/mistralapi', {
        input: `Here are the top five colors I used in RGB format: ${JSON.stringify(colorResponse.data)}. Here is a brief description of it: ${JSON.stringify(hfResponse.data)}. Here is some added information about it: ${questionInput}. Provide suggestions on how I can improve. Do NOT mention the specific RGB values, or quote the text I gave you. Instead, pretend like you are seeing the painting in real life, and critiquing it as my art teacher. Keep it under 100 words.`
      });      

      answerParagraph.innerHTML += `<br><b>Color Palette:</b> ${paletteResponse.data.result}<br>`;
      answerParagraph.innerHTML += `<b>Analysis:</b> ${analysisResponse.data.result}`;

    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      answerParagraph.textContent = 'Error: ' + (error.response?.data?.error || error.message);
    }
  };
});
