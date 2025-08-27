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
      const colorResponse = await axios.post('https://thebaibot.com/color_theory', { image: base64Image });
      const hfResponse = await axios.post('https://thebaibot.com/huggingface', { image: base64Image, question: questionInput });

      let colorString = colorResponse.data.result;
      let colorLines = colorString.trim().split('\n');
      let colors = colorLines.map(line => line.trim().replace(/\[|\]/g,'').split(/\s+/).map(Number));

      const paletteResponse = await axios.post('https://thebaibot.com/mistralapi', {
        input: `Please tell me which color palette is used in my drawing: complementary, analogous, triadic, etc. Here is my color palette in RGB format: ${JSON.stringify(colors)}.`
      });

      const analysisResponse = await axios.post('https://thebaibot.com/mistralapi', {
        input: `Please tell me which color palette is used in my drawing. Here are the top five colors I used in RGB format: ${JSON.stringify(colors)}. Here is a brief description of it: ${JSON.stringify(hfResponse.data)}. Here is some added information about it: ${questionInput}. Provide suggestions on how I can improve. Do NOT mention the specific RGB values, or quote the text I gave you. Instead, pretend like you are seeing the painting in real life, and critiquing it as my art teacher. Keep it under 100 words.`
      });

      answerParagraph.innerHTML = '';

      colors.forEach(rgb => {
        const div = document.createElement("div");
        div.className = "color-square";
        div.style.backgroundColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
        div.style.width = "50px";
        div.style.height = "50px";
        div.style.display = "inline-block";
        div.style.margin = "2px";
        answerParagraph.appendChild(div);
      });

      answerParagraph.innerHTML += `<br><b>Color Palette:</b> ${paletteResponse.data.result}<br>`;
      answerParagraph.innerHTML += `<b>Analysis:</b> ${analysisResponse.data.result}`;

    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      answerParagraph.textContent = 'Error: ' + (error.response?.data?.error || error.message);
    }
  };
});
