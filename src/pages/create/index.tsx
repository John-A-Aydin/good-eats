import { SignIn, useUser } from "@clerk/nextjs";
import Head from "next/head";
import { ChangeEvent, FormEvent, useState } from "react";
import { api } from "~/utils/api";
import toast from 'react-hot-toast';
import axios from "axios";

/*
  TODO's
    - Fix all TODO's
    - Post button should not show unless all requirements are fulfilled
    - crop images to 1200x1200?
*/
type T_postInfo = {
  name: string;
  description: string;
  instructions: string;
  imageTypes: string[];
  nutrition: {
    carbs: number;
    fat: number;
    protien: number;
  };
};

const CreateRecipeWizard = () => { // TODO clear input fields on submit
  
  const MAX_NUMBER_OF_IMAGES = 10;

  const { user } = useUser();
  const ctx = api.useContext();
  const [postInfo , setPostInfo] = useState<T_postInfo>({
    name: "",
    description: "",
    instructions: "",
    imageTypes: [],
    nutrition: {
      carbs: 0,
      protien: 0,
      fat: 0,
    },
  });
  const [selectedImageURLs, setSelectedImageURLs] = useState<string[]>([]);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const { mutate, isLoading: isPosting} = api.recipe.create.useMutation({
    // If post is successfull clear the input and invalidate something 
    onSuccess: async (variables) => {
      
      console.log(variables);

      for (let index = 0; index < selectedImageFiles.length; index++) {
        const presignedURL = variables.presignedURLArray[index];
        const imageFile = selectedImageFiles[index];
        console.log(presignedURL);
        if (!presignedURL || !imageFile) return;
        console.log(imageFile);
        const temp = await axios.put(presignedURL, imageFile);
        console.log(temp);
      }
      setPostInfo({
        name: "",
        description: "",
        instructions: "",
        imageTypes: [],
        nutrition: {
          carbs: 0,
          protien: 0,
          fat: 0,
        },
      });
      void ctx.recipe.getAll.invalidate();

      if (user && user.username)
        window.location.href = `/${user.username}`
      return variables.post;
    },
    // If something goes wrong with post or zod denies content, post message
    onError: (e) => {
      // Grabs error message from zod and prints it
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else { // If there is no error message, shows default message
        toast.error("Failed to post! Please try again later.")
      }
    },
  });
  
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setPostInfo((prev) => {
      return {...prev, [name]: value}
    });
  };

  const handleNutritionChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.valueAsNumber;
    
    setPostInfo((prev) => {
      return {
        ...prev,
         nutrition: {
          ...prev.nutrition,
          [name]: value,
        }
      }
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    /*
      TODO's
        - More rigorous checking for undefined urls, imageIds, and image types
    */
    e.preventDefault();
    
    if (!user ) return;

    // Checking for absent information before calling mutation
    if (postInfo.name == "") {
      toast.error("Please give your recipe a name.");
    } else if (postInfo.description == "") {
      toast.error("Please give your recipe a description.");
    } else if (postInfo.instructions == "") {
      toast.error("Please write some instructions.");
    } else if (!selectedImageFiles[0]) {
      toast.error("Please upload some pictures of your dish.");
    } else {
      mutate(postInfo);
    }
    
  }

  
  

  // When the user successfully selects a file
  const onSelectFile = ( e : React.ChangeEvent<HTMLInputElement>) => {
    // Grabbing 
    if (!e.target.files) return;
    

    const selectedFilesArray = Array.from(e.target.files);
    const imageTypes : string[] = []

    const imagesArray = selectedFilesArray.map((file) => {
      const type = encodeURIComponent(file.type);
      console.log(type);
      imageTypes.push(type);
      return URL.createObjectURL(file);
    });
    
    setSelectedImageURLs((prev) => prev.concat(imagesArray));
    setSelectedImageFiles((prev) => prev.concat(selectedFilesArray));
    setPostInfo((prev) => {
      return {...prev, imageTypes: prev.imageTypes.concat(imageTypes)};
    });
    // FOR BUG IN CHROME
    e.target.value = "";
  }
  function deleteHandler(imageURL : string) {
    const index = selectedImageURLs.indexOf(imageURL);
    setSelectedImageURLs((prev) => prev.splice(index, 1));
    setSelectedImageFiles((prev) => prev.splice(index, 1));
    
    setPostInfo((prev) => {
      return {...prev, imageTypes: prev.imageTypes.splice(index, 1)};
    });
    URL.revokeObjectURL(imageURL);
  }
  /*
   * TODO's
        - Add max and min lengths in input fields
        - Change page title?
        - Remove image index below delete button
   */
  return (
    <>
      <Head>
          <title>Post recipe</title> 
          <meta name="description" content="Recipe sharing website with a focus on fitness" />
          <link rel="icon" href="/favicon.jpg" /> 
      </Head>
      
      <div className="bg-neutral-900 h-screen mx-24 pt-4">
        
          <form onSubmit={handleSubmit} className="flex flex-row rounded-md w-full mb-4">
            <div className="flex flex-col w-full">
              <h3>Name :</h3>
              <textarea
                name="name"
                onChange={handleChange}
                className="bg-neutral-800 rounded-md m-4 py-2 px-4 border-[1px] border-gray-400"
                placeholder="Give your recipe a unique name"
              />
              <h3>Description :</h3>
              <textarea
                name="description"
                onChange={handleChange}
                className="bg-neutral-800 h-24 rounded-md m-4 py-2 px-4 border-[1px] border-gray-400"
                placeholder="Write about your inspiration for the dish or about its flavor"
              /> 
              <h3>Instructions :</h3>
              <textarea
                name="instructions"
                onChange={handleChange}
                className="bg-neutral-800 h-96 rounded-md m-4 py-2 px-4 border-[1px] border-gray-400"
                placeholder="Write detailed instructions with clear steps"
              />
              <button type={"submit"} className="bg-neutral-800 w-16 rounded-full">Post</button>
            </div>
            <div className="flex flex-col m-4">
              <div>
                Protein (g) :
                <input
                  name="protien"
                  onChange={handleNutritionChange}
                  className="bg-neutral-800 w-40 rounded-md m-4 py-1 px-4 border-[1px] border-gray-400" 
                  type="number"
                  placeholder="0.0"
                />
              </div>
              <div>
                Carbs (g) :
                <input
                  name="carbs"
                  onChange={handleNutritionChange}
                  className="bg-neutral-800 w-40 rounded-md m-4 py-1 px-4 border-[1px] border-gray-400" 
                  type="number"
                  placeholder="0.0"
                />
              </div>
              <div>
                Fat (g) :
                <input
                  name="fat"
                  onChange={handleNutritionChange}
                  className="bg-neutral-800 w-40 rounded-md m-4 py-1 px-4 border-[1px] border-gray-400" 
                  type="number"
                  placeholder="0.0"
                />
              </div>
            </div>
          </form>
          
        
        
        <section>
          <label className="p-2 bg-neutral-800 rounded-full">
            + Add Pics
            <input
              className="hidden"
              type="file"
              name="images"
              onChange={onSelectFile}
              multiple
              accept="image/png , image/jpeg, image/webp"
            />
            <br/>
          </label>

        

          {selectedImageURLs.length > 0 &&
            (selectedImageURLs.length > MAX_NUMBER_OF_IMAGES ? (
              <p className="error">
                {`You can't upload more than ${MAX_NUMBER_OF_IMAGES} images`}
                <br />
                <span>
                  please delete <b> {selectedImageURLs.length - MAX_NUMBER_OF_IMAGES} </b> of them{" "}
                </span>
              </p>
            ) : (
              <button
                className="upload-btn"
                onClick={() => {
                  console.log(selectedImageURLs);
                }}
              >
                upload {selectedImageURLs.length} images
                {selectedImageURLs.length === 1 ? "" : "S"}
              </button>
          ))}

          <div className="grid w-full">
            {selectedImageURLs &&
              selectedImageURLs.map((image, index) => {
                return (
                  <div key={image} className="w-1/3">
                    <img
                      className=""
                      src={image}
                      height="200"
                      alt="upload"
                    />
                    <button 
                      onClick={() => deleteHandler(image)}
                      className="bg-rose-500 p-1 rounded-md"
                    >
                      delete
                    </button>
                  </div>
                );
              })}
          </div>
        </section>
        <div>

        </div>
      </div>
    </>
  );
};

export default CreateRecipeWizard;